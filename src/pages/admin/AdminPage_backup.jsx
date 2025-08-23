import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import * as XLSX from 'xlsx';
import { db } from '../../firebase/config';
import { doc, setDoc, collection, getDocs, deleteDoc, query, where, addDoc, orderBy, updateDoc, getDoc } from 'firebase/firestore';
import LucideIcon, { availableIcons } from '../../components/icons/LucideIcon';
import OpenAI from 'openai';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Sistema de toast simples
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Disponibilizar toast globalmente para as funções
  React.useEffect(() => {
    window.toast = {
      success: (msg) => showToast(msg, 'success'),
      error: (msg) => showToast(msg, 'error')
    };
  }, []);
  const [selectedFile, setSelectedFile] = useState(null);
  const [vehiclePreview, setVehiclePreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState("");
  const [importedVehicles, setImportedVehicles] = useState([]);
  const [firestoreVehicles, setFirestoreVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [assigningUUIDs, setAssigningUUIDs] = useState(false);
  
  // Sistema de abas para centro de controle unificado
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estados específicos para aba "Mais Vendidos"
  const [bestSellersVehicles, setBestSellersVehicles] = useState([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(false);
  
  // Estados para gerenciamento de estoque (integração EstoqueAdmin)
  const [adminFilters, setAdminFilters] = useState({
    search: '',
    brand: '',
    model: '',
    status: 'all', // all, active, inactive
    tag: '', // filtro por tag personalizada
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });
  
  // Estados para o modal de edição por placa
  const [editModal, setEditModal] = useState({
    isOpen: false,
    vehicle: null,
    loading: false,
    error: '',
    success: ''
  });

  // Estado para nova foto sendo adicionada
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [editForm, setEditForm] = useState({
    // Campos básicos
    preco: '',
    preco_de: '',
    ano_modelo: '',
    placa: '',
    km: '',
    marca: '',
    modelo: '',
    versao: '',
    combustivel: '',
    cambio: '',
    
    // Campos customizados originais
    promocao: false,
    tipo_veiculo: '',
    ativo: true,
    mais_vendidos: false,
    
    // Sistema simplificado: apenas 1 tag por veículo
    tag: '',
    foto_destaque: '',
    opcionais: '',
    especificacoes: {},
    informacoes: ''
  });

  // Estados para gerenciamento de tags personalizadas
  const [customTags, setCustomTags] = useState([]);
  
  // Estados para o modal expandido
  const [generatingAI, setGeneratingAI] = useState(false);
  const [vehiclePhotos, setVehiclePhotos] = useState([]);
  const [aiGeneratedContent, setAiGeneratedContent] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Função para sugerir preço "DE" com base no preço atual
  const sugerirPrecoDe = (precoPor) => {
    const variacaoMin = 1.03; // 3%
    const variacaoMax = 1.12; // 12%
    const fator = (Math.random() * (variacaoMax - variacaoMin)) + variacaoMin;
    const precoDe = Math.round((precoPor * fator) / 100) * 100;
    return precoDe;
  };

  // Inicializar OpenAI (apenas quando necessário)
  const initOpenAI = () => {
    return new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  };
  
  const [tagModal, setTagModal] = useState({
    isOpen: false,
    isEditing: false,
    tagId: null,
    loading: false,
    error: '',
    success: ''
  });
  const [tagForm, setTagForm] = useState({
    nome: '',
    cor: '#1A75FF',
    icone: '🏷️'
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "atria2025") {
      setIsAuthenticated(true);
      setError("");
      loadFirestoreVehicles(); // Carregar veículos ao fazer login
      loadCustomTags(); // Carregar tags personalizadas
    } else {
      setError("Senha incorreta");
    }
  };

  // Função para carregar veículos do Firestore
  const loadFirestoreVehicles = async () => {
    setLoading(true);
    try {
      console.log("Carregando veículos do Firestore...");
      const vehiclesRef = collection(db, 'veiculos');
      const snapshot = await getDocs(vehiclesRef);
      
      const vehicles = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        vehicles.push({
          id: doc.id,
          ...data
        });
      });
      
      console.log(`Encontrados ${vehicles.length} veículos no Firestore`);
      
      // Filtrar veículos com preços válidos para exibição
      const validPriceVehicles = vehicles.filter(v => v.preco && !isNaN(v.preco) && v.preco > 0);
      console.log(`${validPriceVehicles.length} veículos com preços válidos de ${vehicles.length} total`);
      
      setFirestoreVehicles(vehicles);
      
    } catch (error) {
      console.error("Erro ao carregar veículos do Firestore:", error);
      setImportStatus(`❌ Erro ao carregar veículos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para limpar registros com preços inválidos
  const cleanInvalidPriceRecords = async () => {
    setCleaning(true);
    try {
      console.log("Iniciando limpeza de registros com preços inválidos...");
      
      const vehiclesRef = collection(db, 'veiculos');
      const snapshot = await getDocs(vehiclesRef);
      
      let deletedCount = 0;
      const promises = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const hasInvalidPrice = !data.preco || isNaN(data.preco) || data.preco <= 0;
        
        if (hasInvalidPrice) {
          promises.push(deleteDoc(doc.ref));
          deletedCount++;
        }
      });
      
      if (promises.length > 0) {
        await Promise.all(promises);
        console.log(`${deletedCount} registros com preços inválidos foram removidos`);
        
        // Recarregar lista
        await loadFirestoreVehicles();
        
        setImportStatus(`✅ Limpeza concluída! ${deletedCount} registros com preços inválidos removidos.`);
      } else {
        setImportStatus("✅ Nenhum registro com preço inválido encontrado.");
      }
      
      setTimeout(() => {
        setImportStatus("");
      }, 5000);
      
    } catch (error) {
      console.error("Erro na limpeza:", error);
      setImportStatus(`❌ Erro na limpeza: ${error.message}`);
    } finally {
      setCleaning(false);
    }
  };

  // Função para atribuir UUIDs aos veículos que não têm
  const assignMissingUUIDs = async () => {
    setAssigningUUIDs(true);
    try {
      console.log("Verificando veículos sem UUID...");
      
      const vehiclesRef = collection(db, 'veiculos');
      const snapshot = await getDocs(vehiclesRef);
      
      const vehiclesWithoutUUID = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.vehicle_uuid) {
          vehiclesWithoutUUID.push({
            docRef: doc.ref,
            data: data
          });
        }
      });
      
      if (vehiclesWithoutUUID.length === 0) {
        setImportStatus("✅ Todos os veículos já possuem UUID");
        setTimeout(() => setImportStatus(""), 3000);
        return;
      }

      console.log(`Encontrados ${vehiclesWithoutUUID.length} veículos sem UUID`);
      
      // Função para gerar UUID
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      const updatePromises = vehiclesWithoutUUID.map(async (vehicle) => {
        const newUUID = generateUUID();
        await updateDoc(vehicle.docRef, {
          vehicle_uuid: newUUID
        });
        return newUUID;
      });
      
      await Promise.all(updatePromises);
      
      console.log(`${vehiclesWithoutUUID.length} UUIDs atribuídos com sucesso`);
      setImportStatus(`✅ ${vehiclesWithoutUUID.length} UUIDs atribuídos com sucesso`);
      
      // Recarregar lista de veículos
      await loadFirestoreVehicles();
      
      setTimeout(() => setImportStatus(""), 5000);
      
    } catch (error) {
      console.error("Erro ao atribuir UUIDs:", error);
      setImportStatus(`❌ Erro ao atribuir UUIDs: ${error.message}`);
    } finally {
      setAssigningUUIDs(false);
    }
  };

  // Função para limpar TODOS os veículos existentes
  const clearAllVehicles = async () => {
    setImportStatus("Removendo todos os veículos existentes...");
    const vehiclesRef = collection(db, 'veiculos');
    const snapshot = await getDocs(vehiclesRef);
    
    const deletePromises = [];
    snapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`${deletePromises.length} veículos existentes removidos`);
    }
    
    return deletePromises.length;
  };

  // Função para verificar opcionais (apenas dados reais da planilha)
  const extractOpcionaisFromDescription = (vehicle) => {
    // Se já tem opcionais salvos no Firebase, usar eles
    if (vehicle.opcionais && vehicle.opcionais.trim()) {
      return vehicle.opcionais;
    }

    // A planilha não contém campo de opcionais - retornar vazio
    return '';
  };

  // Função para abrir modal de edição ao clicar na placa
  const openEditModal = (vehicle) => {
    setEditModal({
      isOpen: true,
      vehicle: vehicle,
      loading: false,
      error: '',
      success: ''
    });
    
    // Sugerir preço "DE" automaticamente se não existir
    const precoDeValue = vehicle.preco_de || (vehicle.preco ? sugerirPrecoDe(parseFloat(vehicle.preco)) : '');

    // Preencher formulário com dados existentes
    setEditForm({
      // Campos básicos
      preco: vehicle.preco || '',
      preco_de: precoDeValue,
      ano_modelo: vehicle.ano_modelo || '',
      placa: vehicle.placa || '',
      km: vehicle.km || '',
      marca: vehicle.marca || '',
      modelo: vehicle.modelo || '',
      versao: vehicle.versao || '',
      combustivel: vehicle.combustivel || '',
      cambio: vehicle.cambio || '',
      
      // Campos customizados originais
      promocao: vehicle.promocao || false,
      tipo_veiculo: vehicle.tipo_veiculo || '',
      ativo: vehicle.ativo !== false, // Default true se não estiver definido
      mais_vendidos: vehicle.mais_vendidos || false,
      
      // Sistema simplificado: tag única por veículo
      tag: vehicle.tag ? (typeof vehicle.tag === 'object' ? vehicle.tag.nome : vehicle.tag) : '',
      
      // Campo para controle de exibição de preço De/Por
      mostrar_de_por: vehicle.mostrar_de_por || false,
      foto_destaque: vehicle.foto_destaque || '',
      opcionais: extractOpcionaisFromDescription(vehicle),
      especificacoes: vehicle.especificacoes || {},
      informacoes: vehicle.informacoes || vehicle.descricao || ''
    });
    
    // Carregar fotos do veículo - prioritizar campo 'photos' se existir
    const realPhotos = [];
    
    // Usar campo 'photos' se existir (dados já organizados da importação)
    if (vehicle.photos && Array.isArray(vehicle.photos) && vehicle.photos.length > 0) {
      vehicle.photos.forEach(photo => {
        if (photo && photo.trim()) {
          realPhotos.push(photo);
        }
      });
      console.log('📸 Carregando fotos do campo "photos":', vehicle.photos.length, 'fotos');
    } else {
      // Fallback para o sistema antigo (imagem_capa + imagens)
      // Adicionar foto de capa primeiro (se existir)
      if (vehicle.imagem_capa) {
        realPhotos.push(vehicle.imagem_capa);
      }
      
      // Adicionar outras imagens do array (excluindo a capa para evitar duplicata)
      if (vehicle.imagens && Array.isArray(vehicle.imagens)) {
        vehicle.imagens.forEach(img => {
          if (img && img !== vehicle.imagem_capa) {
            realPhotos.push(img);
          }
        });
      }
      console.log('📸 Carregando fotos do sistema legado:', realPhotos.length, 'fotos');
    }
    
    // Se não tiver nenhuma foto, usar placeholders
    if (realPhotos.length === 0) {
      realPhotos.push('/images/resource/shop3-1.jpg');
      console.log('📸 Usando foto placeholder');
    }
    
    setVehiclePhotos(realPhotos);
    setSelectedPhotoIndex(0);
    
    // Sistema simplificado: tags são gerenciadas por veículo, não por foto
    console.log('🏷️ Tag do veículo:', vehicle.tag || 'Sem tag');
    
    console.log('🔧 Modal de edição expandido aberto para:', vehicle.placa, vehicle.marca, vehicle.modelo);
    console.log('🔍 Dados do veículo:', { marca: vehicle.marca, modelo: vehicle.modelo, versao: vehicle.versao, combustivel: vehicle.combustivel, cambio: vehicle.cambio });
    console.log('📋 Opcionais extraídos:', extractOpcionaisFromDescription(vehicle));
  };

  // Função para carregar veículos "Mais Vendidos" para gerenciamento de ordem
  const loadBestSellersVehicles = async () => {
    setBestSellersLoading(true);
    try {
      console.log('🔍 Carregando veículos "Mais Vendidos" para ordenação...');
      
      const maisVendidosQuery = query(
        collection(db, 'veiculos'),
        where('mais_vendidos', '==', true),
        orderBy('ordem_mais_vendidos', 'asc')
      );
      
      const querySnapshot = await getDocs(maisVendidosQuery);
      const vehicles = [];
      
      querySnapshot.forEach((doc) => {
        const vehicleData = doc.data();
        vehicles.push({
          id: doc.id,
          ...vehicleData
        });
      });
      
      console.log(`✅ ${vehicles.length} veículos "Mais Vendidos" carregados`);
      setBestSellersVehicles(vehicles);
    } catch (error) {
      console.error('Erro ao carregar "Mais Vendidos":', error);
      showToast('Erro ao carregar veículos "Mais Vendidos"', 'error');
    } finally {
      setBestSellersLoading(false);
    }
  };

  // Função para reordenar veículos "Mais Vendidos"
  const reorderBestSellers = async (vehicleId, newOrder) => {
    try {
      const vehicleRef = doc(db, 'veiculos', vehicleId);
      await updateDoc(vehicleRef, {
        ordem_mais_vendidos: newOrder
      });
      
      // Recarregar lista
      await loadBestSellersVehicles();
      showToast('Ordem atualizada com sucesso', 'success');
    } catch (error) {
      console.error('Erro ao reordenar:', error);
      showToast('Erro ao atualizar ordem', 'error');
    }
  };

  // Função para fechar modal de edição
  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      vehicle: null,
      loading: false,
      error: '',
      success: ''
    });
    setEditForm({
      // Campos básicos
      preco: '',
      preco_de: '',
      ano_modelo: '',
      placa: '',
      km: '',
      marca: '',
      modelo: '',
      versao: '',
      combustivel: '',
      cambio: '',
      
      // Campos customizados originais
      promocao: false,
      tipo_veiculo: '',
      mais_vendidos: false,
      
      // Novos campos
      foto_destaque: '',
      opcionais: '',
      especificacoes: {},
      informacoes: ''
    });
    setVehiclePhotos([]);
    setSelectedPhotoIndex(0);
    setGeneratingAI(false);
    setAiGeneratedContent(false);
    setNewPhotoUrl('');
  };

  // === FUNÇÕES PARA GERENCIAMENTO DE FOTOS ===

  // Estado para controle de drag-and-drop
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Funções para drag-and-drop de fotos
  const handleDragStart = (e, index) => {
    setDraggedPhotoIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Só limpar se saindo da área de drop completamente
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedPhotoIndex === null || draggedPhotoIndex === dropIndex) {
      console.log('🚫 Drop cancelado: índices iguais ou inválidos');
      setDraggedPhotoIndex(null);
      setDragOverIndex(null);
      return;
    }

    console.log('🎯 Iniciando drag-and-drop:', `foto ${draggedPhotoIndex} → posição ${dropIndex}`);
    
    try {
      // Executar a movimentação usando a função já existente
      await movePhoto(draggedPhotoIndex, dropIndex);
      console.log('✅ Drag-and-drop concluído com sucesso');
    } catch (error) {
      console.error('❌ Erro no drag-and-drop:', error);
    }
    
    // Limpar estado de drag
    setDraggedPhotoIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedPhotoIndex(null);
    setDragOverIndex(null);
  };

  // Função para adicionar nova foto à galeria
  const addPhotoToGallery = async () => {
    if (!newPhotoUrl.trim() || !editModal.vehicle) return;

    try {
      const documentId = editModal.vehicle.vehicle_uuid || editModal.vehicle.id;
      const vehicleRef = doc(db, 'veiculos', documentId);
      
      // Verificar se o documento existe
      const docSnap = await getDoc(vehicleRef);
      if (!docSnap.exists()) {
        console.warn(`⚠️ Documento não encontrado: ${documentId}. Não é possível adicionar foto.`);
        return;
      }
      
      const currentImages = vehiclePhotos || [];
      const updatedImages = [...currentImages, newPhotoUrl.trim()];

      await updateDoc(vehicleRef, {
        imagens: updatedImages, // Campo legado
        photos: updatedImages,  // Campo novo para galeria admin
        updated_at: new Date()
      });

      setVehiclePhotos(updatedImages);
      setNewPhotoUrl('');
      console.log('✅ Foto adicionada à galeria e salva no campo "photos"');
      
    } catch (error) {
      console.error('❌ Erro ao adicionar foto:', error);
      setEditModal(prev => ({ 
        ...prev, 
        error: `Erro ao adicionar foto: ${error.message}` 
      }));
    }
  };

  // Função para excluir foto da galeria
  const deletePhotoFromGallery = async (photoIndex) => {
    if (!editModal.vehicle || photoIndex < 0 || photoIndex >= vehiclePhotos.length) return;

    if (!window.confirm('Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const documentId = editModal.vehicle.vehicle_uuid || editModal.vehicle.id;
      const vehicleRef = doc(db, 'veiculos', documentId);
      
      // Verificar se o documento existe
      const docSnap = await getDoc(vehicleRef);
      if (!docSnap.exists()) {
        console.warn(`⚠️ Documento não encontrado: ${documentId}. Não é possível excluir foto.`);
        return;
      }
      
      const updatedImages = vehiclePhotos.filter((_, index) => index !== photoIndex);

      await updateDoc(vehicleRef, {
        imagens: updatedImages,  // Campo legado
        photos: updatedImages,   // Campo novo para galeria admin
        imagem_capa: updatedImages[0] || '', // Atualizar capa para primeira foto restante
        updated_at: new Date()
      });

      setVehiclePhotos(updatedImages);
      
      // Ajustar índice selecionado se necessário
      if (selectedPhotoIndex >= updatedImages.length) {
        setSelectedPhotoIndex(Math.max(0, updatedImages.length - 1));
      }
      
      console.log('✅ Foto excluída da galeria');
      
    } catch (error) {
      console.error('❌ Erro ao excluir foto:', error);
      setEditModal(prev => ({ 
        ...prev, 
        error: `Erro ao excluir foto: ${error.message}` 
      }));
    }
  };

  // Função para definir foto como destaque (mover para primeira posição)
  const setPhotoAsHighlight = async (photoIndex) => {
    if (!editModal.vehicle || photoIndex < 0 || photoIndex >= vehiclePhotos.length || photoIndex === 0) return;

    try {
      const documentId = editModal.vehicle.vehicle_uuid || editModal.vehicle.id;
      const vehicleRef = doc(db, 'veiculos', documentId);
      
      // Verificar se o documento existe
      const docSnap = await getDoc(vehicleRef);
      if (!docSnap.exists()) {
        console.warn(`⚠️ Documento não encontrado: ${documentId}. Não é possível definir foto destaque.`);
        return;
      }
      
      const selectedPhoto = vehiclePhotos[photoIndex];
      const otherPhotos = vehiclePhotos.filter((_, index) => index !== photoIndex);
      const reorderedImages = [selectedPhoto, ...otherPhotos];

      await updateDoc(vehicleRef, {
        imagens: reorderedImages,  // Campo legado
        photos: reorderedImages,   // Campo novo para galeria admin
        imagem_capa: selectedPhoto,
        foto_destaque: selectedPhoto,
        updated_at: new Date()
      });

      setVehiclePhotos(reorderedImages);
      setSelectedPhotoIndex(0); // Selecionar a nova foto de capa
      setEditForm(prev => ({ ...prev, foto_destaque: selectedPhoto }));
      
      console.log('✅ Foto definida como destaque e movida para primeira posição');
      
    } catch (error) {
      console.error('❌ Erro ao definir foto destaque:', error);
      setEditModal(prev => ({ 
        ...prev, 
        error: `Erro ao definir foto destaque: ${error.message}` 
      }));
    }
  };

  // Função para mover foto (reordenar)
  const movePhoto = async (fromIndex, toIndex) => {
    if (!editModal.vehicle || fromIndex === toIndex || 
        fromIndex < 0 || fromIndex >= vehiclePhotos.length ||
        toIndex < 0 || toIndex >= vehiclePhotos.length) return;

    try {
      const documentId = editModal.vehicle.vehicle_uuid || editModal.vehicle.id;
      const vehicleRef = doc(db, 'veiculos', documentId);
      
      // Verificar se o documento existe
      const docSnap = await getDoc(vehicleRef);
      if (!docSnap.exists()) {
        console.warn(`⚠️ Documento não encontrado: ${documentId}. Não é possível reordenar foto.`);
        return;
      }
      
      const updatedImages = [...vehiclePhotos];
      const [movedPhoto] = updatedImages.splice(fromIndex, 1);
      updatedImages.splice(toIndex, 0, movedPhoto);

      await updateDoc(vehicleRef, {
        imagens: updatedImages,   // Campo legado
        photos: updatedImages,    // Campo novo para galeria admin
        // Sempre manter a primeira foto como capa
        imagem_capa: updatedImages[0],
        foto_destaque: updatedImages[0],
        updated_at: new Date()
      });

      setVehiclePhotos(updatedImages);
      // Manter a seleção na foto que foi movida
      setSelectedPhotoIndex(toIndex);
      setEditForm(prev => ({ ...prev, foto_destaque: updatedImages[0] }));
      
      console.log('✅ Foto reordenada via Firestore:', fromIndex, '→', toIndex);
      console.log('📸 Nova ordem salva:', updatedImages.map((img, idx) => `${idx}: ${img.substring(img.lastIndexOf('/') + 1)}`));
      
    } catch (error) {
      console.error('❌ Erro ao reordenar foto:', error);
      setEditModal(prev => ({ 
        ...prev, 
        error: `Erro ao reordenar foto: ${error.message}` 
      }));
    }
  };

  // Função para mover foto para esquerda
  const movePhotoLeft = (photoIndex) => {
    if (photoIndex > 0) {
      movePhoto(photoIndex, photoIndex - 1);
    }
  };

  // Função para mover foto para direita
  const movePhotoRight = (photoIndex) => {
    if (photoIndex < vehiclePhotos.length - 1) {
      movePhoto(photoIndex, photoIndex + 1);
    }
  };

  // === SISTEMA SIMPLIFICADO DE TAGS PARA VEÍCULO ===
  // Removido sistema complexo de tags em fotos - agora apenas 1 tag por veículo

  // Função para definir foto como capa (mantém funcionalidade de reordenação)
  const setPhotoAsCoverTag = async (photoIndex) => {
    await setPhotoAsHighlight(photoIndex);
  };



  // Função completa para revisão total do veículo usando OpenAI com análise de imagem e especificações
  const generateCompleteInformation = async () => {
    if (!editModal.vehicle) return;

    setGeneratingAI(true);

    try {
      const { marca, modelo, versao, ano_modelo, imagem_capa, opcionais } = editModal.vehicle;
      
      // Extrair opcionais da planilha
      const opcionaisPlanilha = opcionais || '';

      const prompt = `Analise este veículo brasileiro: ${marca} ${modelo} ${versao || ''} ${ano_modelo}.
Você receberá uma imagem do carro para complementar a análise visual.

Siga rigorosamente as diretrizes abaixo:

1. Correção da Marca
Confirme se o valor ${marca} está correto. Se não estiver, corrija no campo marca_corrigida.

2. Classificação do Tipo de Veículo
Identifique o tipo entre: "Hatch", "Sedan", "SUV" ou "Pick-up".

2.1 Opcionais Recebidos da Planilha
A planilha de estoque forneceu os seguintes opcionais: "${opcionaisPlanilha}".
- Classifique cada item como INTERIOR, EXTERIOR, SEGURANÇA ou CONFORTO.
- NÃO inclua itens que já estejam presentes nos equipamentos de série.
- Adicione os opcionais válidos diretamente no objeto \`equipamentos_por_categoria\`, junto com os itens de série.

3. Equipamentos de Série por Categoria
Liste somente os equipamentos que são de série em TODOS os veículos desse modelo e versão no mercado brasileiro.
Se houver qualquer dúvida ou se for item opcional, NÃO INCLUA.
Tente listar pelo menos 4 itens por categoria (mas não force se não houver):
INTERIOR
EXTERIOR
SEGURANÇA
CONFORTO

4. Análise Visual (imagem)
Observe a imagem enviada e identifique apenas itens visivelmente confirmados, como:
- Rodas de liga leve
- Faróis de neblina
- Central multimídia
- Bancos de couro
- Câmera de ré
- Sensores de estacionamento
⚠️ NÃO deduza com base no modelo — apenas o que for visível com certeza.

5. Especificações Técnicas Confirmadas
Pesquise os dados técnicos exatos para o modelo e versão. Inclua somente se forem padrão da versão informada:
- comprimento (mm)
- altura (mm)
- largura (mm)
- entre_eixos (mm)
- peso (kg)
- porta_malas (litros)
- capacidade (lugares)

6. Descrição Comercial Otimizada para SEO
Escreva um texto de 150–200 palavras com base no perfil típico do comprador no Brasil:
- Faixa etária
- Uso comum (urbano, família, trabalho etc.)
- Motivações (consumo, conforto, visual, revenda)
O texto deve destacar benefícios reais e técnicos. Use linguagem fluida, informativa e confiável.
Inclua palavras-chave buscadas no Google sobre esse carro.
Evite clichês e exageros.

Responda com este JSON:
{
  "marca_corrigida": "${marca}",
  "tipo_veiculo": "Hatch|Sedan|SUV|Pick-up",
  "equipamentos_por_categoria": {
    "INTERIOR": ["item1", "item2", "item3", "item4"],
    "EXTERIOR": ["item1", "item2", "item3", "item4"],
    "SEGURANÇA": ["item1", "item2", "item3", "item4"],
    "CONFORTO": ["item1", "item2", "item3", "item4"]
  },
  "itens_visiveis": ["item visível 1", "item visível 2", "item visível 3"],
  "especificacoes": {
    "comprimento": "valor mm",
    "altura": "valor mm",
    "largura": "valor mm",
    "entre_eixos": "valor mm",
    "peso": "valor kg",
    "porta_malas": "valor litros",
    "capacidade": "valor lugares"
  },
  "descricao_comercial": "Texto persuasivo com foco em SEO e perfil do comprador."
}`;

      const openai = initOpenAI();

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista automotivo. Sua função é analisar veículos brasileiros usando imagem e dados textuais, identificando apenas informações técnicas confirmadas, com alto rigor. Evite suposições.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imagem_capa
                }
              }
            ]
          }
        ],
        max_tokens: 1800,
        temperature: 0.3
      });

      const aiResponse = response.choices[0]?.message?.content || '';

      try {
        const cleanJson = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const aiData = JSON.parse(cleanJson);

        // Processar equipamentos de série
        let opcionaisText = Object.entries(aiData.equipamentos_por_categoria || {})
          .map(([categoria, itens]) => `**${categoria}:**\n${itens.map(item => `• ${item}`).join('\n')}`)
          .join('\n\n');
        
        // Adicionar itens visíveis se existirem
        if (aiData.itens_visiveis && aiData.itens_visiveis.length > 0) {
          opcionaisText += '\n\n**ITENS VISÍVEIS NA FOTO:**\n' + 
            aiData.itens_visiveis.map(item => `• ${item}`).join('\n');
        }

        setEditForm(prev => {
          const novoFormData = {
            ...prev,
            marca: aiData.marca_corrigida || prev.marca,
            tipo_veiculo: aiData.tipo_veiculo || prev.tipo_veiculo,
            opcionais: opcionaisText,
            especificacoes: aiData.especificacoes || prev.especificacoes,
            informacoes: aiData.descricao_comercial || prev.informacoes
          };
          
          console.log('🎯 Dados da IA processados para o formulário:', {
            opcionais_gerados: opcionaisText,
            especificacoes_geradas: aiData.especificacoes,
            informacoes_geradas: aiData.descricao_comercial,
            form_completo: novoFormData
          });
          
          return novoFormData;
        });

        setAiGeneratedContent(true);
        console.log('✨ Análise completa do veículo realizada pela IA');

      } catch (parseError) {
        console.error('Erro ao processar resposta da IA:', parseError);
        setEditForm(prev => ({
          ...prev,
          informacoes: aiResponse
        }));
        setAiGeneratedContent(true);
      }

    } catch (error) {
      console.error('Erro ao gerar análise completa:', error);
      let errorMessage = 'Erro ao gerar análise completa. Verifique sua conexão e tente novamente.';

      if (error.code === 'insufficient_quota') {
        errorMessage = 'Cota da OpenAI excedida. Por favor, configure uma nova chave API ou aguarde a renovação.';
      } else if (error.status === 401) {
        errorMessage = 'Chave API da OpenAI inválida. Verifique as configurações.';
      }

      setEditModal(prev => ({
        ...prev,
        error: errorMessage
      }));
    } finally {
      setGeneratingAI(false);
    }
  };

  // Função para alternar status "Ativo"
  const toggleVehicleActive = async (vehicle) => {
    try {
      const documentId = vehicle.vehicle_uuid || vehicle.id;
      const vehicleRef = doc(db, 'veiculos', documentId);
      
      // Verificar se o documento existe
      const docSnapshot = await getDoc(vehicleRef);
      
      if (!docSnapshot.exists()) {
        console.error('❌ Documento não encontrado para toggle ativo:', documentId);
        return;
      }
      
      const newStatus = !vehicle.ativo;
      
      await updateDoc(vehicleRef, {
        ativo: newStatus
      });
      
      console.log(`✅ Status "Ativo" atualizado:`, {
        placa: vehicle.placa,
        ativo: newStatus
      });
      
      // Feedback visual
      if (window.toast) {
        window.toast.success(`Veículo ${newStatus ? 'ativado' : 'inativado'} com sucesso!`);
      }
      
      // Recarregar lista para refletir mudanças
      await loadFirestoreVehicles();
      
    } catch (error) {
      console.error('❌ Erro ao atualizar status "Ativo":', error);
      if (window.toast) {
        window.toast.error('Erro ao atualizar status do veículo');
      }
    }
  };

  // Função para alternar status de "Homepage" (antes "Mais Vendidos")
  const toggleHomepage = async (vehicle) => {
    try {
      const documentId = vehicle.vehicle_uuid || vehicle.id;
      const vehicleRef = doc(db, 'veiculos', documentId);
      
      // Verificar se o documento existe
      const docSnapshot = await getDoc(vehicleRef);
      
      if (!docSnapshot.exists()) {
        console.error('❌ Documento não encontrado para toggle homepage:', documentId);
        return;
      }
      
      const newStatus = !vehicle.mais_vendidos;
      
      await updateDoc(vehicleRef, {
        mais_vendidos: newStatus
      });
      
      console.log(`✅ Status "Homepage" atualizado:`, {
        placa: vehicle.placa,
        homepage: newStatus
      });
      
      // Feedback visual
      if (window.toast) {
        window.toast.success(`Veículo ${newStatus ? 'adicionado à' : 'removido da'} homepage!`);
      }
      
      // Recarregar lista para refletir mudanças
      await loadFirestoreVehicles();
      
    } catch (error) {
      console.error('❌ Erro ao atualizar status "Homepage":', error);
      if (window.toast) {
        window.toast.error('Erro ao atualizar status da homepage');
      }
    }
  };

  // Função para excluir veículo rapidamente
  const deleteVehicle = async (vehicle) => {
    if (!confirm(`Tem certeza que deseja excluir este veículo?\n\n${vehicle.marca} ${vehicle.modelo}\nPlaca: ${vehicle.placa}\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const documentId = vehicle.vehicle_uuid || vehicle.id;
      const vehicleRef = doc(db, 'veiculos', documentId);
      
      // Verificar se o documento existe
      const docSnapshot = await getDoc(vehicleRef);
      
      if (!docSnapshot.exists()) {
        console.error('❌ Documento não encontrado para exclusão:', documentId);
        if (window.toast) {
          window.toast.error('Veículo não encontrado na base de dados');
        }
        return;
      }
      
      await deleteDoc(vehicleRef);
      
      console.log(`✅ Veículo excluído:`, {
        placa: vehicle.placa,
        marca: vehicle.marca,
        modelo: vehicle.modelo
      });
      
      // Feedback visual
      if (window.toast) {
        window.toast.success('Veículo excluído com sucesso!');
      }
      
      // Recarregar lista para refletir mudanças
      await loadFirestoreVehicles();
      
    } catch (error) {
      console.error('❌ Erro ao excluir veículo:', error);
      if (window.toast) {
        window.toast.error('Erro ao excluir veículo');
      }
    }
  };

  // Função para salvar alterações no Firebase
  const saveVehicleChanges = async () => {
    if (!editModal.vehicle) {
      console.error('❌ Nenhum veículo selecionado para edição');
      return;
    }

    console.log('🔄 Iniciando salvamento do veículo:', editModal.vehicle.placa);
    console.log('📝 Dados do formulário:', editForm);
    console.log('🔍 Veículo completo:', editModal.vehicle);

    setEditModal(prev => ({ ...prev, loading: true, error: '', success: '' }));

    try {
      // CORREÇÃO: Usar vehicle_uuid como ID do documento ao invés do ID antigo
      const documentId = editModal.vehicle.vehicle_uuid || editModal.vehicle.id;
      let vehicleRef = doc(db, 'veiculos', documentId);
      
      console.log('📄 Tentando localizar documento:', {
        vehicle_uuid: editModal.vehicle.vehicle_uuid,
        id_antigo: editModal.vehicle.id,
        placa: editModal.vehicle.placa,
        documentId_usado: documentId
      });
      
      // Primeiro, verificar se o documento existe com o UUID
      let docSnapshot = await getDoc(vehicleRef);
      
      if (!docSnapshot.exists()) {
        console.log('❌ Documento não encontrado com UUID, tentando buscar por placa...');
        
        // Fallback: buscar por placa se UUID não funcionar
        const vehiclesQuery = query(
          collection(db, 'veiculos'),
          where('placa', '==', editModal.vehicle.placa)
        );
        const querySnapshot = await getDocs(vehiclesQuery);
        
        if (!querySnapshot.empty) {
          const foundDoc = querySnapshot.docs[0];
          vehicleRef = foundDoc.ref;
          docSnapshot = foundDoc;
          console.log('✅ Documento encontrado por placa:', {
            firestore_id: foundDoc.id,
            vehicle_uuid: foundDoc.data().vehicle_uuid,
            placa: foundDoc.data().placa
          });
        } else {
          throw new Error(`Documento não encontrado nem por UUID (${documentId}) nem por placa (${editModal.vehicle.placa})`);
        }
      } else {
        console.log('✅ Documento encontrado com UUID:', documentId);
      }
      
      console.log('✅ Documento encontrado no Firestore:', docSnapshot.data());
      
      // Preparar dados para atualização
      const updateData = {
        // Campos básicos (convertendo tipos conforme necessário)
        preco: parseFloat(editForm.preco) || 0,
        preco_de: parseFloat(editForm.preco_de) || 0,
        ano_modelo: parseInt(editForm.ano_modelo) || new Date().getFullYear(),
        placa: editForm.placa.trim(),
        km: parseInt(editForm.km) || 0,
        marca: editForm.marca.trim(),
        modelo: editForm.modelo.trim(),
        versao: editForm.versao.trim(),
        combustivel: editForm.combustivel,
        cambio: editForm.cambio,
        
        // Campos customizados originais
        promocao: editForm.promocao,
        tipo_veiculo: editForm.tipo_veiculo,
        mais_vendidos: editForm.mais_vendidos || false,
        
        // Sistema de tag personalizada como objeto
        tag: editForm.tag ? (() => {
          const selectedTag = customTags.find(t => t.nome === editForm.tag);
          return selectedTag ? {
            nome: selectedTag.nome,
            cor: selectedTag.cor,
            icone: selectedTag.icone
          } : editForm.tag;
        })() : null,
        
        // Novos campos - Sistema de dados completo
        foto_destaque: editForm.foto_destaque || '',
        descricao: editForm.informacoes ? editForm.informacoes.trim() : '',
        informacoes: editForm.informacoes ? editForm.informacoes.trim() : '',
        
        // Opcionais: garantir salvamento tanto como string quanto objeto
        opcionais: editForm.opcionais ? (
          typeof editForm.opcionais === 'string' 
            ? editForm.opcionais.trim()
            : editForm.opcionais
        ) : '',
        
        // Especificações técnicas: garantir salvamento do objeto completo
        especificacoes: editForm.especificacoes && typeof editForm.especificacoes === 'object' 
          ? editForm.especificacoes 
          : {},
        
        // Campo para controle de exibição de preço De/Por
        mostrar_de_por: editForm.mostrar_de_por || false,
        
        updated_at: new Date()
      };

      console.log('💾 Dados preparados para atualização:', updateData);
      console.log('🔍 Verificação específica dos campos da IA:', {
        opcionais_no_form: editForm.opcionais,
        especificacoes_no_form: editForm.especificacoes,
        informacoes_no_form: editForm.informacoes,
        opcionais_no_update: updateData.opcionais,
        especificacoes_no_update: updateData.especificacoes,
        informacoes_no_update: updateData.informacoes
      });
      
      // Atualizar usando merge: true para evitar sobrescrever outros campos
      await updateDoc(vehicleRef, updateData, { merge: true });

      console.log('✅ Veículo atualizado com sucesso no Firestore:', {
        placa: editModal.vehicle.placa,
        id: editModal.vehicle.id,
        campos_atualizados: Object.keys(updateData)
      });

      // Verificar se o salvamento foi bem-sucedido
      const updatedDocSnapshot = await getDoc(vehicleRef);
      const updatedData = updatedDocSnapshot.data();
      console.log('🔍 Dados após atualização:', {
        opcionais: updatedData.opcionais,
        informacoes: updatedData.informacoes,
        especificacoes: updatedData.especificacoes,
        preco: updatedData.preco
      });

      setEditModal(prev => ({ 
        ...prev, 
        loading: false, 
        success: 'Veículo atualizado com sucesso! Dados confirmados no Firestore.' 
      }));

      // Recarregar lista de veículos para refletir alterações
      setTimeout(() => {
        console.log('🔄 Recarregando lista de veículos...');
        loadFirestoreVehicles();
        closeEditModal();
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao salvar alterações:', error);
      console.error('💥 Detalhes do erro:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      setEditModal(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Erro ao salvar: ${error.message}. Verifique o console para mais detalhes.` 
      }));
    }
  };

  // Funções de filtros para gestão de estoque
  const handleAdminSearch = (searchTerm) => {
    setAdminFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleStatusFilter = (status) => {
    setAdminFilters(prev => ({ ...prev, status }));
  };

  const handleSort = (field) => {
    setAdminFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleTagFilter = (tag) => {
    setAdminFilters(prev => ({ ...prev, tag }));
  };

  // Função para filtrar veículos administrativos
  const getFilteredVehicles = () => {
    let filtered = [...firestoreVehicles];

    // Filtro por texto
    if (adminFilters.search) {
      const searchLower = adminFilters.search.toLowerCase();
      filtered = filtered.filter(vehicle => 
        vehicle.marca?.toLowerCase().includes(searchLower) ||
        vehicle.modelo?.toLowerCase().includes(searchLower) ||
        vehicle.placa?.toLowerCase().includes(searchLower) ||
        vehicle.versao?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por status
    if (adminFilters.status !== 'all') {
      if (adminFilters.status === 'active') {
        filtered = filtered.filter(v => v.ativo === true);
      } else if (adminFilters.status === 'inactive') {
        filtered = filtered.filter(v => v.ativo !== true);
      }
    }

    // Filtro por tag personalizada
    if (adminFilters.tag) {
      filtered = filtered.filter(vehicle => {
        if (typeof vehicle.tag === 'object') {
          return vehicle.tag.nome === adminFilters.tag;
        }
        return vehicle.tag === adminFilters.tag;
      });
    }

    // Ordenação
    filtered.sort((a, b) => {
      const field = adminFilters.sortBy;
      let aValue = a[field];
      let bValue = b[field];

      if (field === 'preco') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (field === 'km') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else if (field === 'created_at') {
        aValue = a.created_at?.toDate?.() || new Date(a.created_at) || new Date(0);
        bValue = b.created_at?.toDate?.() || new Date(b.created_at) || new Date(0);
      }

      if (adminFilters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // === FUNÇÕES PARA GERENCIAMENTO DE TAGS PERSONALIZADAS ===

  // Função para carregar tags personalizadas do Firebase
  const loadCustomTags = async () => {
    try {
      console.log("Carregando tags personalizadas...");
      const tagsRef = collection(db, 'tags_customizadas');
      const q = query(tagsRef, orderBy('nome', 'asc'));
      const snapshot = await getDocs(q);
      
      const tags = [];
      snapshot.forEach((doc) => {
        tags.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setCustomTags(tags);
      console.log(`${tags.length} tags personalizadas carregadas:`, tags);
      
    } catch (error) {
      console.error('Erro ao carregar tags personalizadas:', error);
    }
  };

  // Função para abrir modal de nova tag
  const openNewTagModal = () => {
    setTagForm({
      nome: '',
      cor: '#1A75FF',
      icone: 'tag'
    });
    setTagModal({
      isOpen: true,
      isEditing: false,
      tagId: null,
      loading: false,
      error: '',
      success: ''
    });
  };

  // Função para abrir modal de edição de tag
  const openEditTagModal = (tag) => {
    setTagForm({
      nome: tag.nome,
      cor: tag.cor,
      icone: tag.icone
    });
    setTagModal({
      isOpen: true,
      isEditing: true,
      tagId: tag.id,
      loading: false,
      error: '',
      success: ''
    });
  };

  // Função para fechar modal de tag
  const closeTagModal = () => {
    setTagModal({
      isOpen: false,
      isEditing: false,
      tagId: null,
      loading: false,
      error: '',
      success: ''
    });
    setTagForm({
      nome: '',
      cor: '#1A75FF',
      icone: 'tag'
    });
  };

  // Função para salvar tag (nova ou editada)
  const saveTag = async () => {
    if (!tagForm.nome.trim()) {
      setTagModal(prev => ({ ...prev, error: 'Nome da tag é obrigatório' }));
      return;
    }

    setTagModal(prev => ({ ...prev, loading: true, error: '', success: '' }));

    try {
      const tagData = {
        nome: tagForm.nome.trim(),
        cor: tagForm.cor,
        icone: tagForm.icone,
        updated_at: new Date()
      };

      if (tagModal.isEditing) {
        // Editar tag existente
        const tagRef = doc(db, 'tags_customizadas', tagModal.tagId);
        await updateDoc(tagRef, tagData);
        
        setTagModal(prev => ({ 
          ...prev, 
          loading: false, 
          success: 'Tag atualizada com sucesso!' 
        }));
      } else {
        // Criar nova tag
        tagData.created_at = new Date();
        await addDoc(collection(db, 'tags_customizadas'), tagData);
        
        setTagModal(prev => ({ 
          ...prev, 
          loading: false, 
          success: 'Tag criada com sucesso!' 
        }));
      }

      // Recarregar lista de tags
      setTimeout(() => {
        loadCustomTags();
        closeTagModal();
      }, 1500);

    } catch (error) {
      console.error('Erro ao salvar tag:', error);
      setTagModal(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Erro ao salvar: ${error.message}` 
      }));
    }
  };

  // Função para deletar tag
  const deleteTag = async (tagId, tagName) => {
    if (!window.confirm(`Tem certeza que deseja deletar a tag "${tagName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'tags_customizadas', tagId));
      console.log(`Tag "${tagName}" deletada com sucesso`);
      
      // Recarregar lista de tags
      loadCustomTags();
      
    } catch (error) {
      console.error('Erro ao deletar tag:', error);
      alert(`Erro ao deletar tag: ${error.message}`);
    }
  };

  // === FIM DAS FUNÇÕES DE TAGS ===

  // Função para formatar preço
  const formatPrice = (price) => {
    if (!price) return 'R$ 0,00';
    return `R$ ${parseFloat(price).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Função para formatar data
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    let dateObj;
    if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      return 'N/A';
    }
    
    return dateObj.toLocaleDateString('pt-BR');
  };

  // Função para carregar dados já processados
  const handleUploadProcessedVehicles = async () => {
    if (!window.confirm('Esta ação irá LIMPAR todos os veículos existentes e carregar os 199 veículos da planilha. Continuar?')) {
      return;
    }

    setImporting(true);
    setImportStatus("Iniciando processo de atualização...");

    try {
      // SEMPRE limpar dados existentes primeiro
      const deletedCount = await clearAllVehicles();

      // Carregar dados processados do servidor
      setImportStatus("Carregando dados processados do servidor...");
      
      try {
        const response = await fetch('/processed_vehicles.json');
        if (!response.ok) {
          throw new Error('Arquivo de dados processados não encontrado');
        }
        const processedData = await response.json();
        
        setImportStatus(`Fazendo upload de ${processedData.length} veículos...`);
        
        // Upload em lotes de 10
        let uploadedCount = 0;
        for (let i = 0; i < processedData.length; i += 10) {
          const batch = processedData.slice(i, i + 10);
          
          const uploadPromises = batch.map(async (vehicle) => {
            try {
              // Preparar dados de imagens para salvar no campo 'photos'
              const photosArray = [];
              
              // Adicionar imagem de capa como primeira foto
              if (vehicle.imagem_capa && vehicle.imagem_capa.trim()) {
                photosArray.push(vehicle.imagem_capa);
              }
              
              // Adicionar demais imagens (evitar duplicação da imagem de capa)
              if (vehicle.imagens && Array.isArray(vehicle.imagens)) {
                vehicle.imagens.forEach(img => {
                  if (img && img.trim() && !photosArray.includes(img)) {
                    photosArray.push(img);
                  }
                });
              }
              
              // Salvar veículo com campo 'photos' atualizado
              const vehicleData = {
                ...vehicle,
                photos: photosArray, // Campo específico para a galeria de fotos do admin
                updated_at: new Date()
              };

              const docRef = await addDoc(collection(db, 'veiculos'), vehicleData);
              uploadedCount++;
              
              console.log(`✅ Veículo ${vehicle.marca} ${vehicle.modelo} salvo com ${photosArray.length} fotos no campo 'photos'`);
              
              return docRef;
            } catch (error) {
              console.error(`Erro no veículo ${vehicle.marca} ${vehicle.modelo}:`, error);
              return null;
            }
          });
          
          await Promise.all(uploadPromises);
          setImportStatus(`Uploading... ${uploadedCount}/${processedData.length} veículos`);
          
          // Pausa entre lotes
          if (i + 10 < processedData.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        setImportStatus(`✅ Upload concluído! ${uploadedCount} veículos carregados com sucesso.`);
        
        // Recarregar lista
        await loadFirestoreVehicles();
        
      } catch (fetchError) {
        console.error('Erro ao carregar dados processados:', fetchError);
        setImportStatus(`❌ Erro: ${fetchError.message}`);
      }

    } catch (error) {
      console.error("Erro no upload:", error);
      setImportStatus(`❌ Erro no upload: ${error.message}`);
    } finally {
      setImporting(false);
      setTimeout(() => setImportStatus(""), 5000);
    }
  };

  // Função para limpar todos os veículos
  const handleClearAllVehicles = async () => {
    if (!window.confirm('ATENÇÃO: Esta ação irá remover TODOS os veículos do sistema. Esta ação não pode ser desfeita. Continuar?')) {
      return;
    }

    setCleaning(true);
    setImportStatus("Removendo todos os veículos...");

    try {
      const vehiclesRef = collection(db, 'veiculos');
      const snapshot = await getDocs(vehiclesRef);
      
      const deletePromises = [];
      snapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        setImportStatus(`✅ ${deletePromises.length} veículos removidos com sucesso.`);
      } else {
        setImportStatus("✅ Nenhum veículo encontrado para remover.");
      }
      
      // Recarregar lista
      await loadFirestoreVehicles();
      
    } catch (error) {
      console.error("Erro ao limpar veículos:", error);
      setImportStatus(`❌ Erro: ${error.message}`);
    } finally {
      setCleaning(false);
      setTimeout(() => setImportStatus(""), 5000);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setVehiclePreview([]);
    setImportStatus("");
  };

  const handleImportStock = async () => {
    if (!selectedFile) {
      alert("Por favor, selecione uma planilha primeiro");
      return;
    }

    if (!window.confirm('Esta ação irá LIMPAR todos os veículos existentes e carregar os novos da planilha. Continuar?')) {
      return;
    }
    
    setImporting(true);
    setImportStatus("Iniciando importação...");

    try {
      // SEMPRE limpar dados existentes PRIMEIRO
      const deletedCount = await clearAllVehicles();
      setImportStatus(`${deletedCount} veículos existentes removidos. Lendo arquivo Excel...`);
      
      // Ler o arquivo Excel
      const data = await readExcelFile(selectedFile);
      
      if (!data || data.length === 0) {
        throw new Error("Nenhum dado encontrado na planilha");
      }

      setImportStatus(`Processando ${data.length} veículos...`);

      // Importar cada veículo para o Firestore
      let successCount = 0;
      let errorCount = 0;

      for (const vehicle of data) {
        try {
          await importVehicleToFirestore(vehicle);
          successCount++;
          setImportStatus(`Importados: ${successCount}/${data.length}`);
        } catch (error) {
          console.error(`Erro ao importar veículo ${vehicle.codigo}:`, error);
          errorCount++;
        }
      }

      // Salvar veículos importados para exibição
      setImportedVehicles(data.filter((_, index) => index < successCount));
      
      // Recarregar lista do Firestore
      await loadFirestoreVehicles();
      
      // Limpar estado após importação
      setSelectedFile(null);
      setVehiclePreview([]);
      setImportStatus(`✅ Importação concluída! ${successCount} veículos importados, ${errorCount} erros.`);
      
      // Limpar input de arquivo
      const fileInput = document.getElementById('file-upload');
      if (fileInput) {
        fileInput.value = '';
      }

      setTimeout(() => {
        setImportStatus("");
      }, 5000);

    } catch (error) {
      console.error("Erro na importação:", error);
      setImportStatus(`❌ Erro: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Função para ler arquivo Excel
  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Pegar a primeira aba
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Converter para JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Mapear campos conforme especificado na planilha
          const mappedData = jsonData.map((row, index) => {
            // Limpar e converter preço brasileiro (R$ 58.990,00 → 58990.00)
            const precoOriginal = row['Preço'] || row.Preco || row.preco;
            let precoLimpo = String(precoOriginal || '0')
              .replace(/[^\d,.]/g, '') // Remove tudo exceto dígitos, vírgula e ponto
              .replace('.', '') // Remove ponto (separador de milhares)
              .replace(',', '.'); // Substitui vírgula por ponto (decimal)
            
            const precoFinal = parseFloat(precoLimpo) || 0;
            
            // Gerar UUID se não existir
            const generateUUID = () => {
              return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
              });
            };

            // Processar modelo e versão para evitar duplicações
            const modelo = String(row.Modelo || row.modelo || row.MODELO || '');
            const versaoOriginal = String(row['Versão'] || row.Versao || row.versao || '');
            
            // Remover duplicação caso a versão comece com o nome do modelo (case-insensitive)
            let versaoLimpa = versaoOriginal;
            if (modelo && versaoOriginal && versaoOriginal.toLowerCase().startsWith(modelo.toLowerCase())) {
              versaoLimpa = versaoOriginal.substring(modelo.length).trim();
              console.log(`🔧 Duplicação removida: "${modelo}" + "${versaoOriginal}" → "${modelo}" + "${versaoLimpa}"`);
            }

            return {
              codigo: String(row.codigo || row.Codigo || row.CODIGO || `AUTO_${Date.now()}_${index}`),
              vehicle_uuid: String(row.vehicle_uuid || row.VEHICLE_UUID || generateUUID()),
              marca: String(row.Marca || row.marca || row.MARCA || ''),
              modelo: modelo,
              versao: versaoLimpa,
              ano_modelo: parseInt(row['Ano Modelo'] || row.ano_modelo || row.ANO_MODELO || 0),
              ano_fabricacao: parseInt(row['Ano Fabricação'] || row.ano_fabricacao || row.ANO_FABRICACAO || 0),
              combustivel: String(row['Combustível'] || row.Combustivel || row.combustivel || ''),
              km: parseInt(row.KM || row.km || row.Km || 0),
              cor: String(row.Cor || row.cor || row.COR || ''),
              cambio: String(row['Câmbio'] || row.Cambio || row.cambio || ''),
              portas: parseInt(row.Portas || row.portas || row.PORTAS || 4),
              preco: precoFinal,
              placa: String(row.Placa || row.placa || row.PLACA || ''),
              imagem_capa: String(row['Imagem Principal'] || row.imagem_principal || row.imagem_capa || ''),
              imagens: row.Fotos ? String(row.Fotos).split(';').filter(img => img.trim()) : (row.fotos ? String(row.fotos).split(';').filter(img => img.trim()) : []),
              descricao: String(row['Descrição'] || row.Descricao || row.descricao || ''),
              tipo_anuncio: String(row['Tipo de anúncio'] || row.tipo_anuncio || row.TIPO_ANUNCIO || 'venda'),
              ativo: row.Ativo === "true" || row.Ativo === true || row.ativo === true || row.ativo === "true",
              importado: true,
              data_importacao: new Date()
            };
          });

          resolve(mappedData);
        } catch (error) {
          reject(new Error(`Erro ao processar Excel: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Função para importar veículo individual para Firestore
  const importVehicleToFirestore = async (vehicle) => {
    try {
      // Verificar se o veículo já existe (por código ou UUID)
      const vehiclesRef = collection(db, 'veiculos');
      const existingQuery = query(vehiclesRef, where('codigo', '==', vehicle.codigo));
      const existingSnapshot = await getDocs(existingQuery);
      
      let docRef;
      let existingVehicle = null;
      
      if (!existingSnapshot.empty) {
        // Veículo já existe, usar o documento existente
        const existingDoc = existingSnapshot.docs[0];
        docRef = existingDoc.ref;
        existingVehicle = existingDoc.data();
        
        // Preservar UUID existente se houver
        if (existingVehicle.vehicle_uuid) {
          vehicle.vehicle_uuid = existingVehicle.vehicle_uuid;
        }
        
        // Preservar imagens e arrays existentes
        if (existingVehicle.imagens && existingVehicle.imagens.length > 0) {
          vehicle.imagens = existingVehicle.imagens;
        }
        if (existingVehicle.imagem_capa) {
          vehicle.imagem_capa = existingVehicle.imagem_capa;
        }
        if (existingVehicle.tags_personalizadas) {
          vehicle.tags_personalizadas = existingVehicle.tags_personalizadas;
        }
        if (existingVehicle.opcionais) {
          vehicle.opcionais = existingVehicle.opcionais;
        }
        if (existingVehicle.especificacoes) {
          vehicle.especificacoes = existingVehicle.especificacoes;
        }
        if (existingVehicle.informacoes) {
          vehicle.informacoes = existingVehicle.informacoes;
        }
        if (existingVehicle.photos) {
          vehicle.photos = existingVehicle.photos;
        }
      } else {
        // Novo veículo, criar novo documento
        docRef = doc(db, 'veiculos', vehicle.codigo);
      }

      // Preparar dados de imagens para salvar no campo 'photos'
      const photosArray = [];
      
      // Adicionar imagem de capa como primeira foto
      if (vehicle.imagem_capa && vehicle.imagem_capa.trim()) {
        photosArray.push(vehicle.imagem_capa);
      }
      
      // Adicionar demais imagens (evitar duplicação da imagem de capa)
      if (vehicle.imagens && Array.isArray(vehicle.imagens)) {
        vehicle.imagens.forEach(img => {
          if (img && img.trim() && !photosArray.includes(img)) {
            photosArray.push(img);
          }
        });
      }
      
      // Salvar no Firestore com o campo 'photos' atualizado
      const vehicleData = {
        ...vehicle,
        photos: photosArray, // Campo específico para a galeria de fotos do admin
        updated_at: new Date()
      };

      await setDoc(docRef, vehicleData, { merge: true });
      
      console.log(`✅ Veículo ${vehicle.marca} ${vehicle.modelo} salvo com ${photosArray.length} fotos no campo 'photos'`);
      
      return true;
    } catch (error) {
      throw new Error(`Erro ao salvar no Firestore: ${error.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>Admin - Átria Veículos</title>
        </Helmet>
        
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <img height="60" width="150" fetchpriority="low" decoding="async" loading="lazy" src="/images/logos/logo-default.png" alt="Átria Veículos" className="h-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Painel Administrativo
                </h2>
                <p className="text-gray-600 mt-2">
                  Entre com suas credenciais para acessar o sistema
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha de Acesso
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="Digite sua senha"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Entrar
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Painel Admin - Átria Veículos</title>
      </Helmet>
      
      <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
        {/* Header Admin - Estilo do site */}
        <div style={{ 
          backgroundColor: '#1a2332', 
          color: 'white',
          padding: '20px 0',
          borderBottom: '3px solid #1A75FF'
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '0 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img height="60" width="150" fetchpriority="low" decoding="async" loading="lazy" src="/images/logos/logo-white.png" alt="Átria Veículos" style={{ height: '50px' }} />
              <div>
                <h1 style={{ 
                  margin: 0, 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#1A75FF',
                  fontFamily: 'DM Sans, sans-serif'
                }}>
                  Centro de Controle
                </h1>
                <p style={{ 
                  margin: '4px 0 0 0', 
                  color: '#94a3b8', 
                  fontSize: '16px',
                  fontFamily: 'DM Sans, sans-serif'
                }}>
                  Gerencie todos os veículos do seu estoque
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setPassword("");
                setSelectedFile(null);
                setVehiclePreview([]);
                setImportStatus("");
                setImportedVehicles([]);
              }}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
              Sair do Sistema
            </button>
          </div>
        </div>



        {/* Seção Principal */}
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '40px 20px'
        }}>
          
          {/* Toast System */}
          {toast.show && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '14px',
              zIndex: 1000,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
            }}>
              {toast.message}
            </div>
          )}

          {/* Sistema de Abas Integrado */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Navegação das Abas */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}>
              {[
                { id: 'dashboard', label: 'Importar & Limpar' },
                { id: 'estoque', label: 'Gerenciar Estoque' },
                { id: 'bestsellers', label: 'Mais Vendidos' },
                { id: 'tags', label: 'Tags Personalizadas' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '16px 24px',
                    border: 'none',
                    backgroundColor: activeTab === tab.id ? '#1A75FF' : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#64748b',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'DM Sans, sans-serif'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Conteúdo das Abas */}
            <div style={{ padding: '32px' }}>
              {activeTab === 'dashboard' && (
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1a2332',
                    marginBottom: '20px',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                    Centro de Controle Átria Veículos
                  </h2>

                  {/* Estatísticas Rápidas */}
                  <div style={{ 
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '30px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#1a2332',
                      marginBottom: '16px',
                      fontFamily: 'DM Sans, sans-serif'
                    }}>
                      Situação Atual do Estoque
                    </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '2px solid #1A75FF'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#1A75FF' }}>
                  {firestoreVehicles.length}
                </div>
                <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                  Veículos Cadastrados
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '2px solid #10b981'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
                  {firestoreVehicles.filter(v => v.ativo).length}
                </div>
                <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                  Ativos no Site
                </div>
              </div>
            </div>
          </div>

          {/* Sistema de Abas do Centro de Controle */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            marginBottom: '40px',
            overflow: 'hidden'
          }}>
            {/* Navegação das Abas */}
            <div style={{
              display: 'flex',
              borderBottom: '2px solid #f1f5f9'
            }}>
              {[
                { id: 'dashboard', label: '🏠 Dashboard', icon: '🏠' },
                { id: 'estoque', label: '📋 Gerenciar Estoque', icon: '📋' },
                { id: 'tags', label: '🏷️ Gerenciar Tags', icon: '🏷️' },
                { id: 'importar', label: '📊 Importar Planilhas', icon: '📊' },
                { id: 'configuracoes', label: '⚙️ Configurações', icon: '⚙️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    border: 'none',
                    backgroundColor: activeTab === tab.id ? '#1A75FF' : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#64748b',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderBottom: activeTab === tab.id ? '3px solid #1A75FF' : '3px solid transparent',
                    fontFamily: 'DM Sans, sans-serif'
                  }}
                  onMouseOver={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.color = '#1a2332';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#64748b';
                    }
                  }}
                >
                  {tab.label.replace(tab.icon + ' ', '')}
                </button>
              ))}
            </div>

            {/* Conteúdo das Abas */}
            <div style={{ padding: '32px' }}>
              {activeTab === 'dashboard' && (
                <div>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a2332',
                    marginBottom: '20px',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                    Centro de Controle Átria Veículos
                  </h2>
                  
                  {/* Ações Rápidas */}
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                  }}>
                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      padding: '24px',
                      border: '2px solid #e2e8f0',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: '#1A75FF',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '24px'
                      }}>
                        📋
                      </div>
                      <h4 style={{ color: '#1a2332', marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
                        Gerenciar Estoque
                      </h4>
                      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                        Visualize, edite e gerencie todos os veículos
                      </p>
                      <button
                        onClick={() => setActiveTab('estoque')}
                        style={{
                          backgroundColor: '#1A75FF',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        Abrir
                      </button>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      padding: '24px',
                      border: '2px solid #e2e8f0',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: '#8b5cf6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '24px'
                      }}>
                        📊
                      </div>
                      <h4 style={{ color: '#1a2332', marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
                        Importar Planilhas
                      </h4>
                      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                        Carregue veículos via Excel ou CSV
                      </p>
                      <button
                        onClick={() => setActiveTab('importar')}
                        style={{
                          backgroundColor: '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        Abrir
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Gerenciar Estoque */}
              {activeTab === 'estoque' && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#1a2332',
                      marginBottom: '12px',
                      fontFamily: 'DM Sans, sans-serif'
                    }}>
                      Gerenciar Estoque de Veículos
                    </h2>
                    
                    {/* Instruções de Uso */}
                    <div style={{
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #0ea5e9',
                      borderRadius: '8px',
                      padding: '16px',
                      fontSize: '14px',
                      color: '#0369a1'
                    }}>
                      <h4 style={{ margin: '0 0 8px 0', fontWeight: '600' }}>💡 Como usar os controles:</h4>
                      <ul style={{ margin: '0', paddingLeft: '20px' }}>
                        <li><strong>Clique na placa</strong> → Abre modal completo para editar todos os campos do veículo</li>
                        <li><strong>Ativo?</strong> → Verde = veículo aparece no site | Cinza = veículo oculto dos visitantes</li>
                        <li><strong>Homepage?</strong> → Verde = aparece na seção "Mais Vendidos" | Cinza = não aparece</li>
                        <li><strong>Ver</strong> → Abre a página do veículo em nova aba</li>
                        <li><strong>🗑️</strong> → Exclui o veículo permanentemente (cuidado!)</li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Controles de Filtro */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px',
                      alignItems: 'end'
                    }}>
                      {/* Campo de Busca */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '6px'
                        }}>
                          Buscar Veículos
                        </label>
                        <input
                          type="text"
                          placeholder="Marca, modelo, placa..."
                          value={adminFilters.search}
                          onChange={(e) => handleAdminSearch(e.target.value)}
                          style={{
                            width: '100%',
                            height: '40px',
                            padding: '0 12px',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#1A75FF'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>

                      {/* Filtro por Status */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '6px'
                        }}>
                          Status
                        </label>
                        <select
                          value={adminFilters.status}
                          onChange={(e) => handleStatusFilter(e.target.value)}
                          style={{
                            width: '100%',
                            height: '40px',
                            padding: '0 12px',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="all">Todos</option>
                          <option value="active">Ativos</option>
                          <option value="inactive">Inativos</option>
                        </select>
                      </div>

                      {/* Filtro por Tag */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '6px'
                        }}>
                          Filtrar por Tag ({customTags.length} tags)
                        </label>
                        <select
                          value={adminFilters.tag}
                          onChange={(e) => handleTagFilter(e.target.value)}
                          style={{
                            width: '100%',
                            height: '40px',
                            padding: '0 12px',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">Todas as tags</option>
                          {customTags && customTags.length > 0 ? (
                            customTags.map(tag => (
                              <option key={tag.id} value={tag.id}>
                                {tag.nome}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>Carregando tags...</option>
                          )}
                        </select>
                      </div>

                      {/* Ordenação */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '6px'
                        }}>
                          Ordenar por
                        </label>
                        <select
                          value={adminFilters.sortBy}
                          onChange={(e) => handleSort(e.target.value)}
                          style={{
                            width: '100%',
                            height: '40px',
                            padding: '0 12px',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="created_at">Data</option>
                          <option value="marca">Marca</option>
                          <option value="modelo">Modelo</option>
                          <option value="preco">Preço</option>
                          <option value="km">Quilometragem</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Veículos */}
                  {loading ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '60px',
                      backgroundColor: 'white',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #f3f4f6',
                        borderTop: '4px solid #1A75FF',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0'
                    }}>
                      {/* Cabeçalho da Lista */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '70px 2fr 120px 70px 100px 80px 80px 90px 80px 120px',
                        gap: '12px',
                        padding: '16px',
                        backgroundColor: '#1a2332',
                        borderBottom: '2px solid #e2e8f0',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: 'white'
                      }}>
                        <div>Foto</div>
                        <div>Veículo (Clique na placa para editar)</div>
                        <div>Preço</div>
                        <div>Ano</div>
                        <div>Placa</div>
                        <div>KM</div>
                        <div style={{ textAlign: 'center' }}>Ativo?</div>
                        <div style={{ textAlign: 'center' }}>Homepage?</div>
                        <div style={{ textAlign: 'center' }}>Tag</div>
                        <div style={{ textAlign: 'center' }}>Ações</div>
                      </div>

                      {/* Linhas de Veículos */}
                      {getFilteredVehicles().map((vehicle) => (
                        <div
                          key={vehicle.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '70px 2fr 120px 70px 100px 80px 80px 90px 80px 120px',
                            gap: '12px',
                            padding: '16px',
                            borderBottom: '1px solid #f1f5f9',
                            alignItems: 'center',
                            fontSize: '13px',
                            backgroundColor: 'white'
                          }}
                        >
                          <div>
                            {vehicle.imagem_capa ? (
                              <img fetchpriority="low" decoding="async" loading="lazy" src={vehicle.imagem_capa} alt={`${vehicle.marca} ${vehicle.modelo}`} style={{ width: '60px', height: '45px', borderRadius: '6px', objectFit: 'cover' }} />
                            ) : (
                              <div style={{
                                width: '60px',
                                height: '45px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                color: '#9ca3af'
                              }}>
                                Sem foto
                              </div>
                            )}
                          </div>

                          <div>
                            <div style={{ fontWeight: '600', color: '#1f2937' }}>
                              {vehicle.marca} {vehicle.modelo}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {vehicle.versao || 'Versão não informada'}
                            </div>
                          </div>

                          <div style={{ fontWeight: '600', color: '#1f2937' }}>
                            {formatPrice(vehicle.preco)}
                          </div>

                          <div style={{ color: '#374151' }}>
                            {vehicle.ano_modelo || 'N/A'}
                          </div>

                          <div 
                            style={{ 
                              color: '#1A75FF', 
                              fontFamily: 'monospace',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              fontWeight: '600'
                            }}
                            onClick={() => openEditModal(vehicle)}
                            title="Clique para editar campos customizados"
                          >
                            {vehicle.placa || 'N/A'}
                          </div>

                          <div style={{ color: '#374151' }}>
                            {vehicle.km ? `${vehicle.km.toLocaleString()} km` : 'N/A'}
                          </div>

                          {/* Nova Coluna: Status Ativo */}
                          <div style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => toggleVehicleActive(vehicle)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: (vehicle.ativo !== false) ? '#10B981' : '#9CA3AF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                                minWidth: '70px'
                              }}
                              title={(vehicle.ativo !== false) ? 'Inativar Veículo' : 'Ativar Veículo'}
                            >
                              {(vehicle.ativo !== false) ? 'Ativo' : 'Inativo'}
                            </button>
                          </div>

                          {/* Coluna Homepage (ex-Mais Vendidos) */}
                          <div style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => toggleHomepage(vehicle)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: vehicle.mais_vendidos ? '#10B981' : '#9CA3AF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                                minWidth: '50px'
                              }}
                              title={vehicle.mais_vendidos ? 'Remover da Homepage' : 'Adicionar à Homepage'}
                            >
                              {vehicle.mais_vendidos ? 'Sim' : 'Não'}
                            </button>
                          </div>

                          {/* Coluna Tag */}
                          <div style={{ textAlign: 'center', fontSize: '12px' }}>
                            {vehicle.tag ? (() => {
                              const tagData = customTags.find(t => t.id === vehicle.tag);
                              const tagName = tagData?.nome || vehicle.tag;
                              const tagColor = tagData?.cor || '#6B7280';
                              
                              return (
                                <span style={{
                                  backgroundColor: tagColor,
                                  color: 'white',
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontSize: '10px',
                                  fontWeight: '600'
                                }}>
                                  {String(tagName)}
                                </span>
                              );
                            })() : (
                              <span style={{ color: '#9CA3AF', fontSize: '10px' }}>
                                Sem tag
                              </span>
                            )}
                          </div>

                          {/* Ações com botão Ver e Excluir */}
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                            <button
                              onClick={() => {
                                window.open(`/veiculo/${vehicle.vehicle_uuid}`, '_blank');
                              }}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                              title="Ver página do veículo no site"
                            >
                              👁️ Ver
                            </button>
                            <button
                              onClick={() => deleteVehicle(vehicle)}
                              style={{
                                padding: '6px 8px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="ATENÇÃO: Excluir veículo permanentemente"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}

                      {getFilteredVehicles().length === 0 && (
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '60px 20px',
                          color: '#6b7280'
                        }}>
                          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
                            Nenhum veículo encontrado
                          </h3>
                          <p>Tente ajustar os filtros ou termo de busca.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Aba Importar Planilhas */}
              {activeTab === 'importar' && (
                <div>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a2332',
                    marginBottom: '16px',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                    Importar Nova Planilha
                  </h2>
                  <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    marginBottom: '24px'
                  }}>
                    Substitua todo o estoque atual por uma nova planilha Excel. O sistema remove todos os veículos existentes e carrega os novos automaticamente.
                  </p>

                  {/* Botão Upload Rápido */}
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    border: '2px solid #0ea5e9',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '32px',
                    textAlign: 'center'
                  }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#0369a1',
                      marginBottom: '12px'
                    }}>
                      🚀 Upload Rápido
                    </h3>
                    <p style={{
                      color: '#0284c7',
                      fontSize: '16px',
                      marginBottom: '20px'
                    }}>
                      Carregue instantaneamente 199 veículos já processados e prontos para uso.
                    </p>
                    <button
                      onClick={handleUploadProcessedVehicles}
                      disabled={importing}
                      style={{
                        backgroundColor: importing ? '#d1d5db' : '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        padding: '14px 28px',
                        borderRadius: '8px',
                        cursor: importing ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}
                    >
                      {importing ? 'Carregando...' : 'Carregar 199 Veículos'}
                    </button>
                  </div>

                  {/* Upload de Planilha Excel */}
                  <div style={{
                    backgroundColor: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px'
                  }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#1a2332',
                      marginBottom: '16px'
                    }}>
                      📋 Upload de Planilha
                    </h3>
                    
                    <div style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '8px',
                      padding: '32px',
                      textAlign: 'center',
                      marginBottom: '20px',
                      backgroundColor: '#f8fafc'
                    }}>
                      {selectedFile ? (
                        <div>
                          <p style={{ color: '#059669', fontWeight: '600', marginBottom: '8px' }}>
                            ✅ Arquivo selecionado: {selectedFile.name}
                          </p>
                          <p style={{ color: '#6b7280', fontSize: '14px' }}>
                            Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p style={{ color: '#64748b', marginBottom: '12px' }}>
                            Clique para selecionar ou arraste sua planilha aqui
                          </p>
                          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                            Formatos aceitos: .xlsx, .xls, .csv
                          </p>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileSelect}
                        style={{
                          margin: '12px 0',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          backgroundColor: 'white'
                        }}
                      />
                    </div>

                    {vehiclePreview.length > 0 && (
                      <div style={{
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #0ea5e9',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '20px'
                      }}>
                        <h4 style={{ color: '#0369a1', marginBottom: '12px' }}>
                          Preview: {vehiclePreview.length} veículos encontrados
                        </h4>
                        <div style={{
                          maxHeight: '200px',
                          overflowY: 'auto',
                          fontSize: '14px'
                        }}>
                          {vehiclePreview.slice(0, 5).map((vehicle, index) => (
                            <div key={index} style={{
                              padding: '8px',
                              backgroundColor: 'white',
                              borderRadius: '4px',
                              marginBottom: '4px',
                              border: '1px solid #e0f2fe'
                            }}>
                              <strong>{vehicle.marca} {vehicle.modelo}</strong> - 
                              Ano: {vehicle.ano_modelo} - 
                              {formatPrice(vehicle.preco)} - 
                              Placa: {vehicle.placa}
                            </div>
                          ))}
                          {vehiclePreview.length > 5 && (
                            <p style={{ color: '#0284c7', textAlign: 'center', marginTop: '8px' }}>
                              ... e mais {vehiclePreview.length - 5} veículos
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        onClick={handleImportStock}
                        disabled={!selectedFile || importing}
                        style={{
                          backgroundColor: (!selectedFile || importing) ? '#d1d5db' : '#059669',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          cursor: (!selectedFile || importing) ? 'not-allowed' : 'pointer',
                          fontSize: '16px',
                          fontWeight: '600',
                          flex: 1,
                          minWidth: '200px'
                        }}
                      >
                        {importing ? 'Importando...' : 'Importar Veículos'}
                      </button>
                      
                      <button
                        onClick={assignMissingUUIDs}
                        disabled={assigningUUIDs || loading}
                        style={{
                          backgroundColor: assigningUUIDs ? '#d1d5db' : '#1A75FF',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          cursor: assigningUUIDs ? 'not-allowed' : 'pointer',
                          fontSize: '16px',
                          fontWeight: '600',
                          minWidth: '180px'
                        }}
                      >
                        {assigningUUIDs ? 'Atribuindo...' : 'Atribuir UUIDs'}
                      </button>
                      
                      <button
                        onClick={handleClearAllVehicles}
                        disabled={cleaning}
                        style={{
                          backgroundColor: cleaning ? '#d1d5db' : '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          cursor: cleaning ? 'not-allowed' : 'pointer',
                          fontSize: '16px',
                          fontWeight: '600',
                          minWidth: '160px'
                        }}
                      >
                        {cleaning ? 'Limpando...' : 'Limpar Tudo'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Gerenciar Tags */}
              {activeTab === 'tags' && (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                  }}>
                    <div>
                      <h2 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#1a2332',
                        marginBottom: '8px',
                        fontFamily: 'DM Sans, sans-serif'
                      }}>
                        Gerenciar Tags Personalizadas
                      </h2>
                      <p style={{
                        color: '#64748b',
                        fontSize: '16px',
                        margin: 0
                      }}>
                        Crie e gerencie tags customizadas para categorizar seus veículos
                      </p>
                    </div>
                    <button
                      onClick={openNewTagModal}
                      style={{
                        backgroundColor: '#1A75FF',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#1559CC'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#1A75FF'}
                    >
                      ➕ Nova Tag
                    </button>
                  </div>

                  {/* Lista de Tags Existentes */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      backgroundColor: '#1a2332',
                      color: 'white',
                      padding: '16px 24px',
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      Tags Cadastradas ({customTags.length})
                    </div>

                    {customTags.length === 0 ? (
                      <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#64748b'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏷️</div>
                        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
                          Nenhuma tag cadastrada
                        </h3>
                        <p style={{ color: '#9ca3af', marginBottom: '20px' }}>
                          Crie sua primeira tag personalizada para categorizar os veículos
                        </p>
                        <button
                          onClick={openNewTagModal}
                          style={{
                            backgroundColor: '#1A75FF',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '600'
                          }}
                        >
                          Criar Primeira Tag
                        </button>
                      </div>
                    ) : (
                      <div style={{ padding: '20px' }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: '16px'
                        }}>
                          {customTags.map((tag) => (
                            <div key={tag.id} style={{
                              backgroundColor: 'white',
                              borderRadius: '12px',
                              padding: '20px',
                              border: '2px solid #e2e8f0',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                              transition: 'all 0.3s ease'
                            }}>
                              {/* Preview da Tag */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '16px'
                              }}>
                                <div style={{
                                  backgroundColor: tag.cor,
                                  color: 'white',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <LucideIcon name={tag.icone} size={16} color="white" />
                                  <span>{tag.nome}</span>
                                </div>
                              </div>

                              {/* Informações da Tag */}
                              <div style={{
                                fontSize: '14px',
                                color: '#64748b',
                                marginBottom: '16px'
                              }}>
                                <div><strong>Cor:</strong> {tag.cor}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <strong>Ícone:</strong> 
                                  <LucideIcon name={tag.icone} size={16} color="#64748b" />
                                  <span>({tag.icone})</span>
                                </div>
                              </div>

                              {/* Ações */}
                              <div style={{
                                display: 'flex',
                                gap: '8px'
                              }}>
                                <button
                                  onClick={() => openEditTagModal(tag)}
                                  style={{
                                    backgroundColor: '#059669',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    flex: 1
                                  }}
                                >
                                  ✏️ Editar
                                </button>
                                <button
                                  onClick={() => deleteTag(tag.id, tag.nome)}
                                  style={{
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    flex: 1
                                  }}
                                >
                                  🗑️ Deletar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Aba Configurações */}
              {activeTab === 'configuracoes' && (
                <div>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a2332',
                    marginBottom: '20px',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                    Configurações do Sistema
                  </h2>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '40px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
                    <h3 style={{ fontSize: '20px', color: '#64748b', marginBottom: '8px' }}>
                      Seção em Desenvolvimento
                    </h3>
                    <p style={{ color: '#9ca3af' }}>
                      Configurações avançadas estarão disponíveis em breve.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Modal de Edição por Placa */}
          {editModal.isOpen && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                width: '95%',
                maxWidth: '1200px',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1a2332',
                    margin: 0
                  }}>
                    Editar Veículo Completo
                  </h3>
                  <button
                    onClick={closeEditModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      padding: '4px'
                    }}
                  >
                    ×
                  </button>
                </div>

                {editModal.vehicle && (
                  <div>
                    {/* Header com informações do veículo */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '32px'
                    }}>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '8px'
                      }}>
                        {editModal.vehicle.marca} {editModal.vehicle.modelo}
                      </h4>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        margin: 0
                      }}>
                        Placa: <strong>{editModal.vehicle.placa}</strong> • 
                        Ano: {editModal.vehicle.ano_modelo} • 
                        {formatPrice(editModal.vehicle.preco)}
                      </p>
                    </div>

                    {/* Layout em duas colunas */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
                      gap: '32px'
                    }}>
                      
                      {/* Coluna Esquerda - Campos Básicos */}
                      <div>
                        <h5 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '20px',
                          borderBottom: '2px solid #e5e7eb',
                          paddingBottom: '8px'
                        }}>
                          📝 Informações Básicas
                        </h5>

                        {/* Preço */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                          }}>
                            💰 Preço (R$)
                          </label>
                          <input
                            type="number"
                            value={editForm.preco}
                            onChange={(e) => setEditForm(prev => ({ ...prev, preco: e.target.value }))}
                            placeholder="85000"
                            style={{
                              width: '100%',
                              height: '44px',
                              padding: '0 12px',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: 'white'
                            }}
                          />
                        </div>

                        {/* Preço DE */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                          }}>
                            🏷️ Preço DE (R$) - Prévia de desconto
                          </label>
                          <input
                            type="number"
                            value={editForm.preco_de}
                            onChange={(e) => setEditForm(prev => ({ ...prev, preco_de: e.target.value }))}
                            placeholder="95000"
                            style={{
                              width: '100%',
                              height: '44px',
                              padding: '0 12px',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: 'white'
                            }}
                          />
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginTop: '4px'
                          }}>
                            Preço original (com risco) - sugestão automática de +3% a +12% do valor atual
                          </p>
                        </div>

                        {/* Mostrar preço De/Por */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={editForm.mostrar_de_por || false}
                              onChange={(e) => setEditForm(prev => ({ ...prev, mostrar_de_por: e.target.checked }))}
                              style={{
                                marginRight: '8px',
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer'
                              }}
                            />
                            💰 Mostrar preço De/Por (exibir preço riscado)
                          </label>
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginTop: '4px',
                            paddingLeft: '26px'
                          }}>
                            Quando ativo, mostra o preço "DE" riscado no frontend. Quando desativo, exibe apenas o preço principal.
                          </p>
                        </div>

                        {/* Status Ativo */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={editForm.ativo !== false}
                              onChange={(e) => setEditForm(prev => ({ ...prev, ativo: e.target.checked }))}
                              style={{
                                marginRight: '8px',
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer'
                              }}
                            />
                            ✅ Veículo Ativo (visível no site)
                          </label>
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginTop: '4px',
                            paddingLeft: '26px'
                          }}>
                            Quando ativo, o veículo fica visível no estoque. Quando inativo, fica oculto dos visitantes.
                          </p>
                        </div>

                        {/* Mais Vendidos */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={editForm.mais_vendidos || false}
                              onChange={(e) => setEditForm(prev => ({ ...prev, mais_vendidos: e.target.checked }))}
                              style={{
                                marginRight: '8px',
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer'
                              }}
                            />
                            ⭐ Mais Vendidos (exibir na homepage)
                          </label>
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginTop: '4px',
                            paddingLeft: '26px'
                          }}>
                            Quando ativo, este veículo aparecerá na seção "Mais Vendidos" da página inicial.
                          </p>
                        </div>



                        {/* Ano */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                          }}>
                            📅 Ano de Fabricação
                          </label>
                          <input
                            type="number"
                            value={editForm.ano_modelo}
                            onChange={(e) => setEditForm(prev => ({ ...prev, ano_modelo: e.target.value }))}
                            placeholder="2020"
                            min="1980"
                            max="2025"
                            style={{
                              width: '100%',
                              height: '44px',
                              padding: '0 12px',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: 'white'
                            }}
                          />
                        </div>

                        {/* Placa */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                          }}>
                            🚗 Placa
                          </label>
                          <input
                            type="text"
                            value={editForm.placa}
                            onChange={(e) => setEditForm(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                            placeholder="ABC-1234"
                            maxLength="8"
                            style={{
                              width: '100%',
                              height: '44px',
                              padding: '0 12px',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: 'white'
                            }}
                          />
                        </div>

                        {/* Quilometragem */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                          }}>
                            📊 Quilometragem (km)
                          </label>
                          <input
                            type="number"
                            value={editForm.km}
                            onChange={(e) => setEditForm(prev => ({ ...prev, km: e.target.value }))}
                            placeholder="45000"
                            style={{
                              width: '100%',
                              height: '44px',
                              padding: '0 12px',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: 'white'
                            }}
                          />
                        </div>

                        {/* Marca */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                          }}>
                            🏭 Marca
                          </label>
                          <select
                            value={editForm.marca}
                            onChange={(e) => setEditForm(prev => ({ ...prev, marca: e.target.value }))}
                            style={{
                              width: '100%',
                              height: '44px',
                              padding: '0 12px',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: 'white',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="">Selecione a marca</option>
                            <option value="Chevrolet">Chevrolet</option>
                            <option value="Fiat">Fiat</option>
                            <option value="Ford">Ford</option>
                            <option value="Hyundai">Hyundai</option>
                            <option value="Jeep">Jeep</option>
                            <option value="Nissan">Nissan</option>
                            <option value="Peugeot">Peugeot</option>
                            <option value="Renault">Renault</option>
                            <option value="Toyota">Toyota</option>
                            <option value="Volkswagen">Volkswagen</option>
                          </select>
                        </div>

                        {/* Modelo */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                          }}>
                            🚙 Modelo
                          </label>
                          <input
                            type="text"
                            value={editForm.modelo}
                            onChange={(e) => setEditForm(prev => ({ ...prev, modelo: e.target.value }))}
                            placeholder="Civic"
                            style={{
                              width: '100%',
                              height: '44px',
                              padding: '0 12px',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: 'white'
                            }}
                          />
                        </div>

                        {/* Versão */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                          }}>
                            ⭐ Versão
                          </label>
                          <input
                            type="text"
                            value={editForm.versao}
                            onChange={(e) => setEditForm(prev => ({ ...prev, versao: e.target.value }))}
                            placeholder="EXL 2.0"
                            style={{
                              width: '100%',
                              height: '44px',
                              padding: '0 12px',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: 'white'
                            }}
                          />
                        </div>

                        {/* Combustível */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                          }}>
                            ⛽ Combustível
                          </label>
                          <select
                            value={editForm.combustivel}
                            onChange={(e) => setEditForm(prev => ({ ...prev, combustivel: e.target.value }))}
                            style={{
                              width: '100%',
                              height: '44px',
                              padding: '0 12px',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: 'white',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="">Selecione o combustível</option>
                            <option value="Flex">Flex</option>
                            <option value="Gasolina">Gasolina</option>
                            <option value="Etanol">Etanol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Elétrico">Elétrico</option>
                            <option value="Híbrido">Híbrido</option>
                          </select>
                        </div>

                        {/* Câmbio */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                          }}>
                            ⚙️ Câmbio
                          </label>
                          <select
                            value={editForm.cambio}
                            onChange={(e) => setEditForm(prev => ({ ...prev, cambio: e.target.value }))}
                            style={{
                              width: '100%',
                              height: '44px',
                              padding: '0 12px',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: 'white',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="">Selecione o câmbio</option>
                            <option value="Manual">Manual</option>
                            <option value="Automático">Automático</option>
                            <option value="CVT">CVT</option>
                            <option value="Semi-automático">Semi-automático</option>
                          </select>
                        </div>

                        {/* Tipo de Veículo */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                          }}>
                            🚗 Tipo de Veículo
                          </label>
                          <select
                            value={editForm.tipo_veiculo}
                            onChange={(e) => setEditForm(prev => ({ ...prev, tipo_veiculo: e.target.value }))}
                            style={{
                              width: '100%',
                              height: '44px',
                              padding: '0 12px',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: 'white',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="">Selecione o tipo</option>
                            <option value="Hatch">Hatch</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Pick-up">Pick-up</option>
                            <option value="Esportivo">Esportivo</option>
                            <option value="Conversível">Conversível</option>
                          </select>
                        </div>

                        {/* Seletor de Tag do Veículo */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                          }}>
                            🏷️ Tag do Veículo
                          </label>
                          
                          <select
                            value={editForm.tag || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, tag: e.target.value }))}
                            style={{
                              width: '100%',
                              height: '44px',
                              padding: '0 12px',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: 'white',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="">Sem tag</option>
                            {customTags.map(tag => (
                              <option key={tag.id} value={tag.nome}>
                                {tag.nome}
                              </option>
                            ))}
                          </select>
                          
                          <p style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            fontStyle: 'italic',
                            margin: '8px 0 0 0'
                          }}>
                            💡 A tag será exibida no card do carro e na página individual. Você pode criar novas tags no painel acima e aplicar uma por veículo. Não será salva nas fotos.
                          </p>
                        </div>
                      </div>

                      {/* Coluna Direita - Campos Expandidos */}
                      <div>
                        {/* Galeria de Fotos Reestruturada */}
                        <div style={{ marginBottom: '24px' }}>
                          <h5 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '12px'
                          }}>
                            📸 Galeria de Fotos
                          </h5>
                          
                          {/* Foto Principal */}
                          <div style={{
                            position: 'relative',
                            width: '100%',
                            height: '200px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            marginBottom: '16px',
                            border: '2px solid #e5e7eb'
                          }}>
                            {vehiclePhotos.length > 0 && vehiclePhotos[0] ? (
                              <img fetchpriority="low" decoding="async" loading="lazy" src={vehiclePhotos[0]} alt={`Foto destaque do ${editModal.vehicle?.marca} ${editModal.vehicle?.modelo}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onLoad={() => console.log('✅ Foto destaque carregada:', vehiclePhotos[0])}
                                onError={(e) => {
                                  console.log('❌ Erro ao carregar foto destaque:', e.target.src);
                                  e.target.src = 'https://res.cloudinary.com/dj6qfrrfp/image/upload/v1752438441/cars/car-1_vyoddw.jpg';
                                }}
                              />
                            ) : (
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                color: '#6b7280',
                                fontSize: '14px',
                                textAlign: 'center'
                              }}>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
                                <div>Nenhuma foto adicionada</div>
                              </div>
                            )}
                            
                            {/* Indicador de foto destaque */}
                            {vehiclePhotos.length > 0 && (
                              <div style={{
                                position: 'absolute',
                                top: '8px',
                                left: '8px',
                                backgroundColor: '#fbbf24',
                                color: '#000',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '700'
                              }}>
                                ⭐ FOTO DESTAQUE
                              </div>
                            )}
                          </div>
                          
                          {/* Grid de Miniaturas Selecionáveis */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                            gap: '8px',
                            marginBottom: '16px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            padding: '4px'
                          }}>
                            {vehiclePhotos.length > 0 ? vehiclePhotos.map((photo, index) => (
                              <div
                                key={`photo-${index}`}
                                draggable={true}
                                onClick={() => setSelectedPhotoIndex(index)}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                style={{
                                  position: 'relative',
                                  aspectRatio: '1',
                                  backgroundColor: '#f3f4f6',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  cursor: draggedPhotoIndex === index ? 'grabbing' : 'grab',
                                  border: (() => {
                                    if (dragOverIndex === index && draggedPhotoIndex !== index) {
                                      return '3px solid #10b981'; // Verde para área de drop
                                    }
                                    if (selectedPhotoIndex === index) {
                                      return '3px solid #2563eb'; // Azul para selecionado
                                    }
                                    if (draggedPhotoIndex === index) {
                                      return '3px solid #f97316'; // Laranja para sendo arrastado
                                    }
                                    return '2px solid #e5e7eb'; // Padrão
                                  })(),
                                  transition: 'all 0.2s ease',
                                  opacity: draggedPhotoIndex === index ? 0.7 : 1,
                                  transform: draggedPhotoIndex === index ? 'rotate(2deg) scale(0.95)' : 'none'
                                }}
                              >
                                <img fetchpriority="low" decoding="async" loading="lazy" src={photo} alt={`Foto ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => {
                                    e.target.src = 'https://res.cloudinary.com/dj6qfrrfp/image/upload/v1752438441/cars/car-1_vyoddw.jpg';
                                  }}
                                />
                                
                                {/* Badge de capa para primeira foto */}
                                {index === 0 && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '4px',
                                    left: '4px',
                                    backgroundColor: 'rgba(251, 191, 36, 0.9)',
                                    color: '#000',
                                    fontSize: '8px',
                                    padding: '2px 4px',
                                    borderRadius: '3px',
                                    fontWeight: '700'
                                  }}>
                                    CAPA
                                  </div>
                                )}
                                
                                {/* Indicador de seleção */}
                                {selectedPhotoIndex === index && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    fontSize: '10px',
                                    padding: '2px 4px',
                                    borderRadius: '4px',
                                    fontWeight: '700'
                                  }}>
                                    ✓
                                  </div>
                                )}
                                
                                {/* Controles de Ordenação */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: '4px',
                                  left: '4px',
                                  right: '4px',
                                  display: 'flex',
                                  gap: '2px',
                                  justifyContent: 'center'
                                }}>
                                  {/* Botão mover para esquerda */}
                                  {index > 0 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        movePhotoLeft(index);
                                      }}
                                      style={{
                                        width: '24px',
                                        height: '16px',
                                        backgroundColor: 'rgba(59, 130, 246, 0.9)',
                                        color: 'white',
                                        border: 'none',
                                        fontSize: '8px',
                                        borderRadius: '2px',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      title="Mover para esquerda"
                                    >
                                      ←
                                    </button>
                                  )}
                                  
                                  {/* Botão mover para direita */}
                                  {index < vehiclePhotos.length - 1 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        movePhotoRight(index);
                                      }}
                                      style={{
                                        width: '24px',
                                        height: '16px',
                                        backgroundColor: 'rgba(59, 130, 246, 0.9)',
                                        color: 'white',
                                        border: 'none',
                                        fontSize: '8px',
                                        borderRadius: '2px',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      title="Mover para direita"
                                    >
                                      →
                                    </button>
                                  )}
                                </div>
                              </div>
                            )) : (
                              <div style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '20px',
                                color: '#9ca3af',
                                fontSize: '14px'
                              }}>
                                Nenhuma foto adicionada. Use o botão "Adicionar Nova Imagem" abaixo.
                              </div>
                            )}
                          </div>
                          
                          {/* Botões de Controle Externos */}
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '16px',
                            flexWrap: 'wrap'
                          }}>
                            {/* Botão Definir como Capa */}
                            <button
                              onClick={() => setPhotoAsCoverTag(selectedPhotoIndex)}
                              disabled={vehiclePhotos.length === 0 || selectedPhotoIndex === 0}
                              style={{
                                flex: 1,
                                minWidth: '140px',
                                padding: '10px 16px',
                                backgroundColor: (vehiclePhotos.length === 0 || selectedPhotoIndex === 0) ? '#d1d5db' : '#fbbf24',
                                color: (vehiclePhotos.length === 0 || selectedPhotoIndex === 0) ? '#9ca3af' : '#000',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: (vehiclePhotos.length === 0 || selectedPhotoIndex === 0) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              title={selectedPhotoIndex === 0 ? 'Esta já é a foto de capa' : 'Definir foto selecionada como capa'}
                            >
                              ⭐ Definir como Capa
                            </button>
                            
                            {/* Botão Remover Imagem */}
                            <button
                              onClick={() => deletePhotoFromGallery(selectedPhotoIndex)}
                              disabled={vehiclePhotos.length === 0}
                              style={{
                                flex: 1,
                                minWidth: '140px',
                                padding: '10px 16px',
                                backgroundColor: vehiclePhotos.length === 0 ? '#d1d5db' : '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: vehiclePhotos.length === 0 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              title="Remover foto selecionada"
                            >
                              🗑️ Remover Imagem
                            </button>
                          </div>
                          
                          {/* Campo e Botão para Adicionar Nova Foto */}
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '12px'
                          }}>
                            <input
                              type="text"
                              value={newPhotoUrl}
                              onChange={(e) => setNewPhotoUrl(e.target.value)}
                              placeholder="Cole a URL da nova foto aqui..."
                              style={{
                                flex: 1,
                                height: '44px',
                                padding: '0 12px',
                                border: '2px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                backgroundColor: 'white'
                              }}
                            />
                            <button
                              onClick={addPhotoToGallery}
                              disabled={!newPhotoUrl.trim()}
                              style={{
                                padding: '10px 20px',
                                backgroundColor: newPhotoUrl.trim() ? '#10b981' : '#d1d5db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: newPhotoUrl.trim() ? 'pointer' : 'not-allowed',
                                minWidth: '140px'
                              }}
                            >
                              ➕ Adicionar Nova Imagem
                            </button>
                          </div>
                          
                          {/* Texto explicativo */}
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            fontStyle: 'italic',
                            margin: '0',
                            padding: '12px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}>
                            💡 <strong>Sistema Simplificado:</strong> Clique numa foto para selecioná-la (borda azul). Use o seletor de tag acima para aplicar a mesma tag em todas as fotos do veículo. Para reordenar, <strong>arraste e solte</strong> as fotos ou use as setas ← →. Use "Definir como Capa" para mover a foto selecionada para primeira posição.
                          </p>
                        </div>

                        <h5 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '20px',
                          borderBottom: '2px solid #e5e7eb',
                          paddingBottom: '8px'
                        }}>
                          🎯 Configurações Avançadas
                        </h5>



                        {/* Foto Principal */}
                        <div style={{ marginBottom: '24px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '8px'
                          }}>
                            📸 Foto Destaque
                          </label>
                          <input
                            type="text"
                            value={editForm.foto_destaque}
                            onChange={(e) => setEditForm(prev => ({ ...prev, foto_destaque: e.target.value }))}
                            placeholder="URL da foto principal do veículo"
                            style={{
                              width: '100%',
                              height: '44px',
                              padding: '0 12px',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: 'white'
                            }}
                          />
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginTop: '4px'
                          }}>
                            URL da imagem que aparecerá como destaque nos cards
                          </p>
                        </div>

                        {/* Opcionais e Equipamentos */}
                        <div style={{ marginBottom: '24px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '12px'
                          }}>
                            🔧 Opcionais e Equipamentos
                          </label>
                          
                          {/* Container com visualização organizada */}
                          <div style={{
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            overflow: 'hidden'
                          }}>
                            {/* Visualização das 4 categorias em grid */}
                            {editForm.opcionais && editForm.opcionais.trim() ? (
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1px',
                                backgroundColor: '#e5e7eb'
                              }}>
                                {(() => {
                                  // Parse do texto em categorias
                                  const sections = {};
                                  const lines = editForm.opcionais.split('\n');
                                  let currentCategory = '';
                                  
                                  lines.forEach(line => {
                                    const trimmed = line.trim();
                                    if (trimmed.startsWith('**') && trimmed.endsWith(':**')) {
                                      currentCategory = trimmed.replace(/\*\*/g, '').replace(':', '');
                                      sections[currentCategory] = [];
                                    } else if (trimmed.startsWith('• ') && currentCategory) {
                                      sections[currentCategory].push(trimmed.replace('• ', ''));
                                    }
                                  });
                                  
                                  const categories = ['INTERIOR', 'EXTERIOR', 'SEGURANÇA', 'CONFORTO'];
                                  const categoryIcons = {
                                    'INTERIOR': '🏠',
                                    'EXTERIOR': '🚗',
                                    'SEGURANÇA': '🛡️',
                                    'CONFORTO': '✨'
                                  };
                                  
                                  return categories.map(category => (
                                    <div key={category} style={{
                                      backgroundColor: 'white',
                                      padding: '12px',
                                      minHeight: '120px'
                                    }}>
                                      <div style={{
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#1A75FF',
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}>
                                        {categoryIcons[category]} {category}
                                      </div>
                                      <div style={{
                                        fontSize: '11px',
                                        color: '#374151',
                                        lineHeight: '1.4'
                                      }}>
                                        {sections[category] && sections[category].length > 0 ? (
                                          sections[category].map((item, idx) => (
                                            <div key={idx} style={{
                                              padding: '2px 0',
                                              borderBottom: idx < sections[category].length - 1 ? '1px solid #f3f4f6' : 'none'
                                            }}>
                                              • {item}
                                            </div>
                                          ))
                                        ) : (
                                          <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                                            Nenhum item
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ));
                                })()}
                              </div>
                            ) : (
                              <div style={{
                                padding: '40px',
                                textAlign: 'center',
                                color: '#9ca3af',
                                fontSize: '14px'
                              }}>
                                <div style={{ marginBottom: '8px' }}>🔧</div>
                                <div>Use a "Análise Completa com IA" para gerar automaticamente</div>
                                <div>os opcionais organizados por categoria</div>
                              </div>
                            )}
                            
                            {/* Campo de edição expandível */}
                            <div style={{
                              borderTop: '1px solid #e5e7eb',
                              backgroundColor: '#f9fafb'
                            }}>
                              <button
                                onClick={() => {
                                  const textArea = document.getElementById('opcionais-textarea');
                                  if (textArea.style.display === 'none') {
                                    textArea.style.display = 'block';
                                  } else {
                                    textArea.style.display = 'none';
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  fontSize: '12px',
                                  color: '#6b7280',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                ✏️ Clique para editar manualmente
                              </button>
                              <textarea
                                id="opcionais-textarea"
                                value={editForm.opcionais}
                                onChange={(e) => setEditForm(prev => ({ ...prev, opcionais: e.target.value }))}
                                placeholder="Formato esperado:
**INTERIOR:**
• Ar-condicionado
• Direção hidráulica

**EXTERIOR:**
• Rodas de liga leve
• Faróis de neblina

**SEGURANÇA:**
• Freios ABS
• Airbags frontais

**CONFORTO:**
• Vidros elétricos
• Travamento elétrico"
                                rows="8"
                                style={{
                                  width: '100%',
                                  padding: '12px',
                                  border: 'none',
                                  fontSize: '12px',
                                  backgroundColor: 'white',
                                  resize: 'vertical',
                                  display: 'none',
                                  fontFamily: 'monospace'
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Especificações Técnicas */}
                        <div style={{ marginBottom: '24px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '12px'
                          }}>
                            ⚙️ Especificações Técnicas
                          </label>
                          
                          {/* Container para especificações */}
                          <div style={{
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            overflow: 'hidden'
                          }}>
                            {/* Visualização das especificações */}
                            {editForm.especificacoes && Object.keys(editForm.especificacoes).length > 0 ? (
                              <div style={{
                                padding: '16px',
                                backgroundColor: 'white'
                              }}>
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: '12px',
                                  fontSize: '13px'
                                }}>
                                  {Object.entries(editForm.especificacoes).map(([key, value]) => (
                                    <div key={key} style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      padding: '8px 12px',
                                      backgroundColor: '#f8fafc',
                                      borderRadius: '6px',
                                      border: '1px solid #e2e8f0'
                                    }}>
                                      <span style={{
                                        fontWeight: '500',
                                        color: '#475569'
                                      }}>
                                        {key}:
                                      </span>
                                      <span style={{
                                        color: '#1A75FF',
                                        fontWeight: '600'
                                      }}>
                                        {value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div style={{
                                padding: '40px',
                                textAlign: 'center',
                                color: '#9ca3af',
                                fontSize: '14px'
                              }}>
                                <div style={{ marginBottom: '8px' }}>⚙️</div>
                                <div>Use a "Análise Completa com IA" para gerar automaticamente</div>
                                <div>as especificações técnicas do veículo</div>
                              </div>
                            )}
                            
                            {/* Campo de edição manual (JSON) */}
                            <div style={{
                              borderTop: '1px solid #e5e7eb',
                              backgroundColor: '#f9fafb'
                            }}>
                              <button
                                onClick={() => {
                                  const textArea = document.getElementById('especificacoes-textarea');
                                  if (textArea.style.display === 'none') {
                                    textArea.style.display = 'block';
                                  } else {
                                    textArea.style.display = 'none';
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  fontSize: '12px',
                                  color: '#6b7280',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                📝 Editar especificações manualmente (formato JSON)
                              </button>
                              <textarea
                                id="especificacoes-textarea"
                                value={JSON.stringify(editForm.especificacoes, null, 2)}
                                onChange={(e) => {
                                  try {
                                    const parsed = JSON.parse(e.target.value);
                                    setEditForm(prev => ({ ...prev, especificacoes: parsed }));
                                  } catch (error) {
                                    // Ignore JSON parse errors while typing
                                  }
                                }}
                                placeholder={'Exemplo:\n{\n  "Motor": "2.0 16V Flex",\n  "Potência": "150 cv",\n  "Torque": "20,4 kgfm"\n}'}
                                rows="4"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: 'none',
                                  backgroundColor: '#f9fafb',
                                  fontSize: '12px',
                                  fontFamily: 'monospace',
                                  resize: 'vertical',
                                  display: 'none'
                                }}
                              />
                            </div>
                          </div>
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginTop: '4px'
                          }}>
                            Especificações técnicas geradas pela IA ou inseridas manualmente (motor, potência, torque, etc.)
                          </p>
                        </div>

                        {/* Informações Gerais */}
                        <div style={{ marginBottom: '24px' }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}>
                            <label style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#374151'
                            }}>
                              📋 Informações Adicionais
                            </label>
                            <button
                              onClick={generateCompleteInformation}
                              disabled={generatingAI}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: generatingAI ? '#d1d5db' : '#2563EB',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: generatingAI ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {generatingAI ? '⏳ Analisando veículo...' : '🤖 Análise Completa com IA'}
                            </button>
                          </div>
                          <textarea
                            value={editForm.informacoes}
                            onChange={(e) => {
                              setEditForm(prev => ({ ...prev, informacoes: e.target.value }));
                              // Remove a marcação de conteúdo IA quando o usuário edita manualmente
                              if (aiGeneratedContent) {
                                setAiGeneratedContent(false);
                              }
                            }}
                            placeholder="Clique em 'Gerar com IA' para criar automaticamente um texto comercial profissional, ou insira informações manualmente..."
                            rows="6"
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: `2px solid ${aiGeneratedContent ? '#3B82F6' : '#d1d5db'}`,
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: aiGeneratedContent ? '#EFF6FF' : 'white',
                              color: aiGeneratedContent ? '#1E40AF' : '#374151',
                              resize: 'vertical',
                              lineHeight: '1.5',
                              fontStyle: aiGeneratedContent ? 'italic' : 'normal'
                            }}
                          />
                          {aiGeneratedContent && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginTop: '6px',
                              fontSize: '12px',
                              color: '#3B82F6',
                              fontWeight: '500'
                            }}>
                              <span>🤖</span>
                              <span>Conteúdo gerado por IA - você pode editar este texto</span>
                            </div>
                          )}
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginTop: '4px'
                          }}>
                            Descrição comercial, características técnicas, perfil do comprador e diferenciais do veículo. Use "Gerar Descrição" para criar texto automático.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Feedback */}
                    {editModal.error && (
                      <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '14px'
                      }}>
                        {editModal.error}
                      </div>
                    )}

                    {editModal.success && (
                      <div style={{
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#16a34a',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '14px'
                      }}>
                        {editModal.success}
                      </div>
                    )}

                    {/* Botões */}
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'flex-end'
                    }}>
                      <button
                        onClick={closeEditModal}
                        style={{
                          padding: '12px 20px',
                          border: '2px solid #d1d5db',
                          backgroundColor: 'white',
                          color: '#374151',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={saveVehicleChanges}
                        disabled={editModal.loading}
                        style={{
                          padding: '12px 20px',
                          border: 'none',
                          backgroundColor: editModal.loading ? '#d1d5db' : '#1A75FF',
                          color: 'white',
                          borderRadius: '8px',
                          cursor: editModal.loading ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        {editModal.loading ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status geral de importação (fora das abas) */}
          {importStatus && (
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: importStatus.includes('✅') 
                ? '#f0fdf4' 
                : importStatus.includes('❌') 
                ? '#fef2f2' 
                : '#fef3c7',
              border: importStatus.includes('✅') 
                ? '1px solid #bbf7d0' 
                : importStatus.includes('❌') 
                ? '1px solid #fecaca' 
                : '1px solid #fde68a',
              color: importStatus.includes('✅') 
                ? '#16a34a' 
                : importStatus.includes('❌') 
                ? '#dc2626' 
                : '#92400e'
            }}>
              {importStatus}
            </div>
          )}

          {/* Modal de Criação/Edição de Tags */}
          {tagModal.isOpen && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {tagModal.isEditing ? 'Editar Tag' : 'Nova Tag Personalizada'}
                  </h3>
                  <button
                    onClick={closeTagModal}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#6b7280',
                      padding: '4px'
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Preview da Tag */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: '24px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    color: '#475569',
                    marginBottom: '12px'
                  }}>
                    Preview da Tag:
                  </h4>
                  <div style={{
                    backgroundColor: tagForm.cor,
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    minWidth: '120px',
                    justifyContent: 'center'
                  }}>
                    <LucideIcon name={tagForm.icone} size={16} color="white" />
                    <span>{tagForm.nome || 'Nome da Tag'}</span>
                  </div>
                </div>

                {/* Formulário */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      📝 Nome da Tag
                    </label>
                    <input
                      type="text"
                      value={tagForm.nome}
                      onChange={(e) => setTagForm(prev => ({
                        ...prev,
                        nome: e.target.value
                      }))}
                      placeholder="Ex: Super Oferta, 1 dono, Blindado..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      🎨 Cor da Tag
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={tagForm.cor}
                        onChange={(e) => setTagForm(prev => ({
                          ...prev,
                          cor: e.target.value
                        }))}
                        style={{
                          width: '60px',
                          height: '40px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      />
                      <input
                        type="text"
                        value={tagForm.cor}
                        onChange={(e) => setTagForm(prev => ({
                          ...prev,
                          cor: e.target.value
                        }))}
                        placeholder="#1A75FF"
                        style={{
                          flex: 1,
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {['#1A75FF', '#F97316', '#DC2626', '#059669', '#7C3AED', '#DB2777'].map(color => (
                        <button
                          key={color}
                          onClick={() => setTagForm(prev => ({ ...prev, cor: color }))}
                          style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: color,
                            border: tagForm.cor === color ? '3px solid #1f2937' : '2px solid #e5e7eb',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      🎨 Ícone da Tag
                    </label>
                    
                    {/* Seletor de ícones por categoria */}
                    <div style={{
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      {/* Agrupamento por categoria */}
                      {Object.entries(
                        availableIcons.reduce((acc, icon) => {
                          if (!acc[icon.category]) acc[icon.category] = [];
                          acc[icon.category].push(icon);
                          return acc;
                        }, {})
                      ).map(([category, icons]) => (
                        <div key={category} style={{ marginBottom: '16px' }}>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px',
                            borderBottom: '1px solid #e5e7eb',
                            paddingBottom: '4px'
                          }}>
                            {category}
                          </h4>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                            gap: '8px'
                          }}>
                            {icons.map(icon => (
                              <button
                                key={icon.name}
                                onClick={() => setTagForm(prev => ({ ...prev, icone: icon.name }))}
                                title={icon.label}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  padding: '8px 4px',
                                  backgroundColor: tagForm.icone === icon.name ? '#1A75FF' : 'transparent',
                                  color: tagForm.icone === icon.name ? 'white' : '#374151',
                                  border: '2px solid',
                                  borderColor: tagForm.icone === icon.name ? '#1A75FF' : '#e5e7eb',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                  if (tagForm.icone !== icon.name) {
                                    e.target.style.backgroundColor = '#f3f4f6';
                                  }
                                }}
                                onMouseOut={(e) => {
                                  if (tagForm.icone !== icon.name) {
                                    e.target.style.backgroundColor = 'transparent';
                                  }
                                }}
                              >
                                <LucideIcon 
                                  name={icon.name} 
                                  size={20} 
                                  color={tagForm.icone === icon.name ? 'white' : '#374151'} 
                                />
                                <span style={{ 
                                  marginTop: '4px',
                                  fontSize: '10px',
                                  textAlign: 'center',
                                  lineHeight: '1.2'
                                }}>
                                  {icon.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mensagens de Status */}
                {tagModal.error && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '14px'
                  }}>
                    {tagModal.error}
                  </div>
                )}

                {tagModal.success && (
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#16a34a',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '14px'
                  }}>
                    {tagModal.success}
                  </div>
                )}

                {/* Botões de Ação */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={closeTagModal}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveTag}
                    disabled={tagModal.loading}
                    style={{
                      backgroundColor: tagModal.loading ? '#9ca3af' : '#1A75FF',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: tagModal.loading ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {tagModal.loading && (
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid currentColor',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                    )}
                    {tagModal.loading ? 'Salvando...' : (tagModal.isEditing ? 'Atualizar Tag' : 'Criar Tag')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toast.show && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1050,
              fontSize: '14px',
              fontWeight: '500',
              maxWidth: '400px'
            }}>
              {toast.message}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 
