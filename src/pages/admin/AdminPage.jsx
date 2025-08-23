import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { db } from '../../firebase/config';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc, addDoc, query, where, orderBy } from 'firebase/firestore';
import LucideIcon, { availableIcons } from '../../components/icons/LucideIcon';

// Lazy loading para componente de leads
const AdminLeadsEmailStyle = lazy(() => import('../../components/AdminLeadsEmailStyle'));


// Componente para input de tags com autocomplete
const TagInput = ({ allTags, onAddTag, placeholder }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (value) => {
    setInputValue(value);
    
    if (value.trim()) {
      const filteredSuggestions = allTags.filter(tag => 
        tag.toLowerCase().includes(value.toLowerCase()) && 
        tag.toLowerCase() !== value.toLowerCase()
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onAddTag(inputValue.trim());
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    onAddTag(suggestion);
    setInputValue('');
    setShowSuggestions(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      />
      
      {showSuggestions && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          maxHeight: '150px',
          overflowY: 'auto',
          zIndex: 10,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => selectSuggestion(suggestion)}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                fontSize: '14px',
                color: '#374151'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  
  // Estados principais
  const [activeTab, setActiveTab] = useState('dashboard');
  const [firestoreVehicles, setFirestoreVehicles] = useState([]);
  const [bestSellersVehicles, setBestSellersVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados de importação
  const [selectedFile, setSelectedFile] = useState(null);
  const [vehiclePreview, setVehiclePreview] = useState([]);
  const [importStatus, setImportStatus] = useState("");
  const [importedVehicles, setImportedVehicles] = useState([]);
  const [clearBeforeImport, setClearBeforeImport] = useState(true);
  
  // Estados de edição de veículo
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [aiWasUsed, setAiWasUsed] = useState(false); // Rastrear se IA foi usada nesta sessão
  const [generatingAi, setGeneratingAi] = useState(false);
  
  // Estados para Tags
  const [customTags, setCustomTags] = useState([]);
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
    icone: 'tag'
  });
  
  // Estados para Toast
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  
  // Estados para Vídeo da Semana
  const [videoForm, setVideoForm] = useState({
    video_url: ''
  });
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState('');

  // Estados para Blog
  const [blogPosts, setBlogPosts] = useState([]);
  const [allBlogTags, setAllBlogTags] = useState([]);
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    content: '',
    coverImage: null,
    coverImageUrl: '',
    category: '',
    tags: [],
    isHidden: false,
    manualSlug: false
  });
  const [blogModal, setBlogModal] = useState({
    isOpen: false,
    isEditing: false,
    postId: null,
    loading: false,
    error: '',
    success: ''
  });
  const [blogLoading, setBlogLoading] = useState(false);

  // Estados para Depoimentos
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialForm, setTestimonialForm] = useState({
    nome: '',
    foto: '',
    cidade: '',
    depoimento: '',
    rating: 5
  });
  const [testimonialModal, setTestimonialModal] = useState({
    isOpen: false,
    isEditing: false,
    testimonialId: null,
    loading: false,
    error: '',
    success: ''
  });
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);

  // Estados para processamento em lote via IA
  const [processandoLoteIA, setProcessandoLoteIA] = useState(false);
  const [progressoIA, setProgressoIA] = useState({
    atual: 0,
    total: 0,
    veiculoAtual: ''
  });

  // Funções utilitárias para Blog
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-'); // Remove hífens duplos
  };

  const validateSlug = async (slug, currentPostId = null) => {
    try {
      const postsRef = collection(db, 'blog_posts');
      const snapshot = await getDocs(postsRef);
      
      const existingPost = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.slug === slug && doc.id !== currentPostId;
      });
      
      return !existingPost;
    } catch (error) {
      console.error('Erro ao validar slug:', error);
      return false;
    }
  };

  const uploadCoverImage = async (file) => {
    // Simular upload - em produção seria para Firebase Storage
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  };

  // Funções CRUD do Blog
  const loadBlogPosts = async () => {
    setBlogLoading(true);
    try {
      const postsRef = collection(db, 'blog_posts');
      const q = query(postsRef, orderBy('publishedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setBlogPosts(posts);
      
      // Extrair apenas tags únicas dos posts existentes (categorias são fixas)
      const tags = [...new Set(posts.flatMap(post => post.tags || []))];
      
      setAllBlogTags(tags);
      
      console.log('✅ Posts do blog carregados:', posts.length);
      console.log('✅ Tags encontradas:', tags);
    } catch (error) {
      console.error('❌ Erro ao carregar posts do blog:', error);
      showToast('Erro ao carregar posts do blog', 'error');
    } finally {
      setBlogLoading(false);
    }
  };

  const openBlogModal = (post = null) => {
    if (post) {
      // Editando post existente
      setBlogForm({
        title: post.title,
        slug: post.slug,
        content: post.content,
        coverImage: null,
        coverImageUrl: post.coverImageUrl || '',
        category: post.category || '',
        tags: post.tags || [],
        isHidden: post.isHidden || false,
        manualSlug: true
      });
      setBlogModal({
        isOpen: true,
        isEditing: true,
        postId: post.id,
        loading: false,
        error: '',
        success: ''
      });
    } else {
      // Criando novo post
      setBlogForm({
        title: '',
        slug: '',
        content: '',
        coverImage: null,
        coverImageUrl: '',
        category: '',
        tags: [],
        isHidden: false,
        manualSlug: false
      });
      setBlogModal({
        isOpen: true,
        isEditing: false,
        postId: null,
        loading: false,
        error: '',
        success: ''
      });
    }
  };

  const closeBlogModal = () => {
    setBlogModal({ isOpen: false, isEditing: false, postId: null, loading: false, error: '', success: '' });
    setBlogForm({ title: '', slug: '', content: '', coverImage: null, coverImageUrl: '', category: '', tags: [], isHidden: false, manualSlug: false });
  };

  const handleBlogFormChange = (field, value) => {
    setBlogForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      // Auto-gerar slug se não foi editado manualmente
      if (field === 'title' && !prev.manualSlug) {
        newForm.slug = generateSlug(value);
      }
      
      return newForm;
    });
  };

  const handleSlugChange = (value) => {
    setBlogForm(prev => ({
      ...prev,
      slug: value,
      manualSlug: true
    }));
  };

  // Funções para manipular tags
  const addBlogTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !blogForm.tags.includes(trimmedTag)) {
      setBlogForm(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
  };

  const removeBlogTag = (tagToRemove) => {
    setBlogForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInput = (e, inputValue, setInputValue) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addBlogTag(inputValue);
      setInputValue('');
    }
  };

  const saveBlogPost = async () => {
    setBlogModal(prev => ({ ...prev, loading: true, error: '', success: '' }));
    
    try {
      // Validações
      if (!blogForm.title.trim()) {
        throw new Error('Título é obrigatório');
      }
      if (!blogForm.content.trim()) {
        throw new Error('Conteúdo é obrigatório');
      }
      if (!blogForm.slug.trim()) {
        throw new Error('Slug é obrigatório');
      }
      if (!blogForm.category.trim()) {
        throw new Error('Categoria é obrigatória');
      }
      
      // Validar slug único
      const isSlugValid = await validateSlug(blogForm.slug, blogModal.postId);
      if (!isSlugValid) {
        throw new Error('Este slug já está em uso. Escolha outro.');
      }
      
      // Upload da imagem de capa se houver
      let coverImageUrl = blogForm.coverImageUrl;
      if (blogForm.coverImage) {
        coverImageUrl = await uploadCoverImage(blogForm.coverImage);
      }
      
      const postData = {
        title: blogForm.title.trim(),
        slug: blogForm.slug.trim(),
        content: blogForm.content.trim(),
        coverImageUrl,
        category: blogForm.category.trim(),
        tags: blogForm.tags.filter(tag => tag.trim()).map(tag => tag.trim()),
        isHidden: blogForm.isHidden,
        updatedAt: new Date().toISOString()
      };
      
      if (blogModal.isEditing) {
        // Atualizar post existente
        const postRef = doc(db, 'blog_posts', blogModal.postId);
        await updateDoc(postRef, postData);
        
        setBlogModal(prev => ({ ...prev, success: 'Post atualizado com sucesso!' }));
        showToast('Post atualizado com sucesso!', 'success');
      } else {
        // Criar novo post
        postData.publishedAt = new Date().toISOString();
        postData.createdAt = new Date().toISOString();
        
        await addDoc(collection(db, 'blog_posts'), postData);
        
        setBlogModal(prev => ({ ...prev, success: 'Post criado com sucesso!' }));
        showToast('Post criado com sucesso!', 'success');
      }
      
      // Recarregar lista de posts
      await loadBlogPosts();
      
      setTimeout(() => {
        closeBlogModal();
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      setBlogModal(prev => ({ ...prev, error: error.message }));
    } finally {
      setBlogModal(prev => ({ ...prev, loading: false }));
    }
  };

  const deleteBlogPost = async (postId, postTitle) => {
    if (!window.confirm(`Tem certeza que deseja excluir o post "${postTitle}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'blog_posts', postId));
      showToast('Post excluído com sucesso!', 'success');
      await loadBlogPosts();
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      showToast('Erro ao excluir post', 'error');
    }
  };

  // Função para importar posts do site antigo
  const importLegacyBlogPosts = async () => {
    if (!window.confirm('Importar posts do site antigo? Esta ação irá adicionar posts de exemplo ao blog.')) {
      return;
    }

    try {
      setBlogLoading(true);
      showToast('Iniciando importação dos posts antigos...', 'info');

      // Posts do site antigo (dados fornecidos pelo usuário)
      const legacyPosts = [
        {
          title: "É perigoso usar GPS?",
          slug: "como-usar-gps",
          coverImage: "https://lirp.cdn-website.com/6fcc5fff/dms3rep/multi/opt/WhatsApp+Image+2025-07-11+at+10.37.01-1920w.jpeg",
          publishedAt: "2025-07-11",
          content: "<p>O GPS se tornou uma ferramenta indispensável no dia a dia dos motoristas, oferecendo navegação precisa e rotas otimizadas. No entanto, é importante usar essa tecnologia com responsabilidade para evitar riscos no trânsito.</p><p><strong>Principais cuidados ao usar GPS:</strong></p><ul><li>Configure o destino antes de iniciar a viagem</li><li>Use suporte adequado para fixar o dispositivo no painel</li><li>Mantenha o volume em nível apropriado para ouvir instruções sem prejudicar a audição de sons externos</li><li>Não manipule o GPS enquanto dirige</li><li>Mantenha os mapas sempre atualizados</li></ul><p>O GPS é seguro quando usado corretamente, proporcionando mais segurança e praticidade nas viagens.</p>"
        },
        {
          title: "Cuidados para preservar a pintura do seu carro",
          slug: "cuidados-para-preservar-a-pintura-do-seu-carro",
          coverImage: "https://lirp.cdn-website.com/6fcc5fff/dms3rep/multi/opt/AdobeStock_1053477041-1920w.jpeg",
          publishedAt: "2025-03-25",
          content: "<p>A pintura do carro é uma das características mais importantes para manter a aparência e o valor do veículo. Com cuidados adequados, é possível preservar o brilho e a proteção por muito mais tempo.</p><p><strong>Dicas essenciais para cuidar da pintura:</strong></p><ul><li>Lave o carro regularmente com produtos específicos</li><li>Evite estacionar sob sol forte por longos períodos</li><li>Use cera protetora a cada 3 meses</li><li>Remova manchas e sujeiras imediatamente</li><li>Evite produtos abrasivos na lavagem</li><li>Mantenha o carro coberto quando possível</li></ul><p>Investir na manutenção da pintura é garantir que seu veículo mantenha uma aparência impecável e preserve seu valor de revenda.</p>"
        },
        {
          title: "O que fazer se seu carro quebrar na estrada?",
          slug: "o-que-fazer-se-seu-carro-quebrar-na-estrada",
          coverImage: "https://lirp.cdn-website.com/6fcc5fff/dms3rep/multi/opt/WhatsApp+Image+2025-03-06+at+11.38.58-1920w.jpeg",
          publishedAt: "2025-03-06",
          content: "<p>Uma pane na estrada pode acontecer com qualquer veículo. O importante é manter a calma e seguir os procedimentos corretos para garantir sua segurança e resolver o problema da melhor forma.</p><p><strong>Primeiros passos em caso de pane:</strong></p><ol><li>Sinalize imediatamente com pisca-alerta</li><li>Pare em local seguro, preferencialmente no acostamento</li><li>Coloque o triângulo a 30 metros do veículo</li><li>Vista o colete refletivo antes de sair do carro</li><li>Avalie o problema e decida se é possível resolver</li><li>Ligue para o seguro ou assistência 24h</li></ol><p>A preparação e o conhecimento são fundamentais para enfrentar situações de emergência na estrada com segurança.</p>"
        },
        {
          title: "Como Dirigir com Segurança em Caso de Neblina",
          slug: "como-dirigir-sob-neblina",
          coverImage: "https://lirp.cdn-website.com/6fcc5fff/dms3rep/multi/opt/AdobeStock_683209823-1920w.jpeg",
          publishedAt: "2024-12-16",
          content: "<p>Dirigir com neblina é uma das situações mais perigosas no trânsito. A visibilidade reduzida exige cuidados especiais e técnicas específicas para garantir a segurança de todos.</p><p><strong>Regras fundamentais para dirigir na neblina:</strong></p><ul><li>Reduza significativamente a velocidade</li><li>Mantenha distância maior do veículo da frente</li><li>Use farol baixo - nunca o alto</li><li>Acenda o pisca-alerta em caso de parada</li><li>Siga as faixas de trânsito como referência</li><li>Evite ultrapassagens</li></ul><p>Em casos de neblina muito densa, o ideal é parar em local seguro e aguardar a melhoria das condições de visibilidade.</p>"
        },
        {
          title: "Cuidados com a lavagem do seu automóvel",
          slug: "cuidados-com-a-lavagem-do-seu-automovel",
          coverImage: "https://lirp.cdn-website.com/6fcc5fff/dms3rep/multi/opt/AdobeStock_603083116-1920w.jpeg",
          publishedAt: "2024-10-21",
          content: "<p>A lavagem correta do automóvel vai muito além da aparência. É fundamental para manter a pintura, prevenir corrosão e preservar o valor do veículo a longo prazo.</p><p><strong>Passos para uma lavagem adequada:</strong></p><ol><li>Enxágue o carro para remover sujeiras soltas</li><li>Use xampu neutro específico para carros</li><li>Lave de cima para baixo, seção por seção</li><li>Use duas buchas: uma para o corpo, outra para rodas</li><li>Enxágue completamente para remover resíduos</li><li>Seque com pano de microfibra ou camurça</li></ol><p>Cuidar adequadamente da lavagem é investir na durabilidade e beleza do seu veículo.</p>"
        },
        {
          title: "Carros para a família: Como escolher o modelo ideal",
          slug: "carro-para-familia",
          coverImage: "https://lirp.cdn-website.com/6fcc5fff/dms3rep/multi/opt/600x600-1-1920w.png",
          publishedAt: "2024-10-01",
          content: "<p>Escolher um carro para toda a família é uma decisão importante que envolve diversos fatores além do preço. Conforto, segurança e praticidade devem ser prioritários.</p><p><strong>Características essenciais:</strong></p><ul><li>Espaço interno adequado para todos os ocupantes</li><li>Porta-malas com boa capacidade</li><li>Consumo de combustível econômico</li><li>Itens de segurança completos</li><li>Facilidade de manutenção</li></ul><p>O carro ideal para família é aquele que oferece o melhor custo-benefício considerando as necessidades específicas do seu dia a dia.</p>"
        }
      ];

      let importedCount = 0;
      let errorCount = 0;

      for (const post of legacyPosts) {
        try {
          // Verificar se já existe um post com o mesmo slug
          const existingQuery = query(
            collection(db, 'blog_posts'),
            where('slug', '==', post.slug)
          );
          const existingSnapshot = await getDocs(existingQuery);
          
          if (existingSnapshot.empty) {
            // Post não existe, pode importar
            const postData = {
              ...post,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              status: 'published'
            };
            
            await addDoc(collection(db, 'blog_posts'), postData);
            importedCount++;
            console.log(`✅ Post "${post.title}" importado com sucesso`);
          } else {
            console.log(`⚠️ Post "${post.title}" já existe, pulando...`);
          }
        } catch (error) {
          console.error(`❌ Erro ao importar post "${post.title}":`, error);
          errorCount++;
        }
      }

      showToast(`✅ Importação concluída! ${importedCount} posts importados, ${errorCount} erros`, 'success');
      
      // Recarregar lista de posts
      loadBlogPosts();

    } catch (error) {
      console.error('Erro na importação:', error);
      showToast('Erro ao importar posts antigos. Tente novamente.', 'error');
    } finally {
      setBlogLoading(false);
    }
  };

  // Funções para Depoimentos
  const loadTestimonials = async () => {
    setTestimonialsLoading(true);
    try {
      const testimonialsRef = collection(db, 'depoimentos');
      const snapshot = await getDocs(testimonialsRef);
      
      const testimonialsData = [];
      snapshot.forEach(doc => {
        testimonialsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Ordenar por data de criação (mais recente primeiro)
      testimonialsData.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA;
      });
      
      setTestimonials(testimonialsData);
    } catch (error) {
      console.error('Erro ao carregar depoimentos:', error);
      showToast('Erro ao carregar depoimentos', 'error');
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const openTestimonialModal = (testimonial = null) => {
    if (testimonial) {
      setTestimonialForm({
        nome: testimonial.nome || '',
        foto: testimonial.foto || '',
        cidade: testimonial.cidade || '',
        depoimento: testimonial.depoimento || '',
        rating: testimonial.rating || 5
      });
      setTestimonialModal({
        isOpen: true,
        isEditing: true,
        testimonialId: testimonial.id,
        loading: false,
        error: '',
        success: ''
      });
    } else {
      setTestimonialForm({
        nome: '',
        foto: '',
        cidade: '',
        depoimento: '',
        rating: 5
      });
      setTestimonialModal({
        isOpen: true,
        isEditing: false,
        testimonialId: null,
        loading: false,
        error: '',
        success: ''
      });
    }
  };

  const closeTestimonialModal = () => {
    setTestimonialModal(prev => ({ ...prev, isOpen: false }));
    setTimeout(() => {
      setTestimonialForm({
        nome: '',
        foto: '',
        cidade: '',
        depoimento: '',
        rating: 5
      });
      setTestimonialModal({
        isOpen: false,
        isEditing: false,
        testimonialId: null,
        loading: false,
        error: '',
        success: ''
      });
    }, 300);
  };

  const handleTestimonialFormChange = (field, value) => {
    setTestimonialForm(prev => ({ ...prev, [field]: value }));
    // Limpar erros quando o usuário começar a digitar
    if (testimonialModal.error) {
      setTestimonialModal(prev => ({ ...prev, error: '' }));
    }
  };

  const saveTestimonial = async () => {
    if (!testimonialForm.nome.trim() || !testimonialForm.depoimento.trim()) {
      setTestimonialModal(prev => ({ ...prev, error: 'Nome e depoimento são obrigatórios' }));
      return;
    }

    setTestimonialModal(prev => ({ ...prev, loading: true, error: '', success: '' }));
    
    try {
      const testimonialData = {
        nome: testimonialForm.nome.trim(),
        foto: testimonialForm.foto.trim() || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 99) + 1}.jpg`,
        cidade: testimonialForm.cidade.trim() || 'Campinas/SP',
        depoimento: testimonialForm.depoimento.trim(),
        rating: testimonialForm.rating,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (testimonialModal.isEditing) {
        const testimonialRef = doc(db, 'depoimentos', testimonialModal.testimonialId);
        await updateDoc(testimonialRef, {
          ...testimonialData,
          created_at: testimonials.find(t => t.id === testimonialModal.testimonialId)?.created_at || testimonialData.created_at
        });
        showToast('Depoimento atualizado com sucesso!', 'success');
      } else {
        await addDoc(collection(db, 'depoimentos'), testimonialData);
        showToast('Depoimento criado com sucesso!', 'success');
      }
      
      await loadTestimonials();
      closeTestimonialModal();
    } catch (error) {
      console.error('Erro ao salvar depoimento:', error);
      setTestimonialModal(prev => ({ ...prev, error: 'Erro ao salvar depoimento. Tente novamente.' }));
    } finally {
      setTestimonialModal(prev => ({ ...prev, loading: false }));
    }
  };

  const deleteTestimonial = async (testimonialId, testimonialName) => {
    if (!window.confirm(`Tem certeza que deseja excluir o depoimento de "${testimonialName}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'depoimentos', testimonialId));
      showToast('Depoimento excluído com sucesso!', 'success');
      await loadTestimonials();
    } catch (error) {
      console.error('Erro ao excluir depoimento:', error);
      showToast('Erro ao excluir depoimento', 'error');
    }
  };
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    tag: '',
    status: ''
  });

  // Estados para modal de edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',  // ID do documento no Firestore
    vehicle_uuid: '',
    marca: '',
    modelo: '',
    versao: '',
    ano: '',
    preco: '',
    preco_de: '',
    km: '',
    combustivel: '',
    cambio: '',
    placa: '',
    ativo: false,
    mais_vendidos: false,
    mostrar_de_por: false,
    custom_tag: null,
    photos: [],
    equipamentos: {},
    informacoes: '',
    especificacoes_tecnicas: {}
  });

  // Função de autenticação
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "atria2025admin") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Senha incorreta. Tente novamente.");
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
      

      
      // Log para verificar campos de data disponíveis
      if (vehicles.length > 0) {
        console.log("🔍 Campos de data disponíveis no primeiro veículo:", {
          data_cadastro: vehicles[0].data_cadastro,
          data_atualizacao: vehicles[0].data_atualizacao,
          created_at: vehicles[0].created_at,
          updated_at: vehicles[0].updated_at,
          timestamp: vehicles[0].timestamp
        });
      }
      
      console.log(`Encontrados ${vehicles.length} veículos no Firestore`);
      

      
      setFirestoreVehicles(vehicles);
      
    } catch (error) {
      console.error("Erro ao carregar veículos do Firestore:", error);
      setImportStatus(`❌ Erro ao carregar veículos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar veículos "Mais Vendidos"
  const loadBestSellersVehicles = async () => {
    try {
      console.log("🔍 Carregando veículos \"Mais Vendidos\" do Firestore...");
      const vehiclesRef = collection(db, 'veiculos');
      const snapshot = await getDocs(vehiclesRef);
      
      const vehicles = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.mais_vendidos === true) {
          vehicles.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      // Ordenar por campo 'ordem' se existir, caso contrário manter ordem atual
      vehicles.sort((a, b) => {
        const ordemA = a.ordem || 999;
        const ordemB = b.ordem || 999;
        return ordemA - ordemB;
      });
      
      console.log(`✅ ${vehicles.length} veículos únicos "Mais Vendidos" carregados e ordenados do Firestore`);
      setBestSellersVehicles(vehicles);
      
    } catch (error) {
      console.error("❌ Erro ao carregar veículos \"Mais Vendidos\":", error);
      showToast(`Erro ao carregar veículos "Mais Vendidos": ${error.message}`, 'error');
    }
  };

  // Função para mover veículo no carrossel
  const moveVehicleInCarousel = async (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= bestSellersVehicles.length) return;
    
    try {
      const newOrder = [...bestSellersVehicles];
      const [movedVehicle] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, movedVehicle);
      
      // Atualizar ordem no Firestore
      for (let i = 0; i < newOrder.length; i++) {
        const vehicle = newOrder[i];
        // Usar vehicle.id (ID do documento) ao invés de vehicle_uuid
        await updateDoc(doc(db, 'veiculos', vehicle.id), {
          ordem: i + 1
        });
      }
      
      setBestSellersVehicles(newOrder);
      showToast('Ordem do carrossel atualizada com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro ao reordenar veículos:', error);
      showToast('Erro ao reordenar veículos', 'error');
    }
  };

  // Função para excluir veículo individual
  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('⚠️ ATENÇÃO: Esta ação irá EXCLUIR permanentemente este veículo. Esta operação é IRREVERSÍVEL. Continuar?')) {
      return;
    }

    try {
      // Usar o ID do documento ao invés de vehicle_uuid
      await deleteDoc(doc(db, 'veiculos', vehicleId));
      
      // Remover da lista local
      setFirestoreVehicles(prev => prev.filter(v => v.id !== vehicleId));
      setBestSellersVehicles(prev => prev.filter(v => v.id !== vehicleId));
      
      showToast('Veículo excluído com sucesso', 'success');
      
    } catch (error) {
      console.error('❌ Erro ao excluir veículo:', error);
      showToast('Erro ao excluir veículo', 'error');
    }
  };

  // Função para mostrar toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Função DEBUG para investigar Ford Bronco
  const debugBroncoData = () => {
    console.log('\n🔍 === INVESTIGANDO FORD BRONCO DUPLICATA ===');
    
    const broncos = firestoreVehicles.filter(v => 
      v.modelo && v.modelo.toLowerCase().includes('bronco')
    );
    
    console.log(`🚙 Total Ford Broncos encontrados: ${broncos.length}`);
    
    broncos.forEach((bronco, index) => {
      const key = `${bronco.placa}_${bronco.modelo}_${bronco.ano}`.toLowerCase();
      console.log(`\n--- BRONCO ${index + 1} ---`);
      console.log(`ID: ${bronco.vehicle_uuid}`);
      console.log(`Placa: "${bronco.placa}"`);
      console.log(`Marca: "${bronco.marca}"`);
      console.log(`Modelo: "${bronco.modelo}"`);
      console.log(`Ano: "${bronco.ano}" (tipo: ${typeof bronco.ano})`);
      console.log(`Chave gerada: "${key}"`);
      console.log(`Data cadastro: ${bronco.data_cadastro}`);
      console.log(`Data atualização: ${bronco.data_atualizacao}`);
    });
    
    // Detectar chaves duplicadas
    const chaves = broncos.map(b => `${b.placa}_${b.modelo}_${b.ano}`.toLowerCase());
    const duplicatas = chaves.filter((chave, index) => chaves.indexOf(chave) !== index);
    
    if (duplicatas.length > 0) {
      console.log('\n❌ CHAVES DUPLICADAS DETECTADAS:');
      duplicatas.forEach(chave => console.log(`  "${chave}"`));
    } else {
      console.log('\n✅ Nenhuma chave duplicada detectada');
    }
    
    console.log('\n🔚 === FIM DA INVESTIGAÇÃO ===\n');
  };

  // Tornar a função global para debug via console
  window.debugBroncoData = debugBroncoData;

  // Função para atualização inteligente de estoque
  const handleUpdateStock = async () => {
    if (!selectedFile) {
      showToast('Selecione um arquivo primeiro', 'error');
      return;
    }

    if (!confirm('🔄 ATUALIZAÇÃO INTELIGENTE\n\nEsta função irá:\n✅ Atualizar preços e fotos de veículos existentes\n✅ Adicionar novos veículos da planilha\n✅ Preservar dados corrigidos pela IA\n❌ EXCLUIR veículos que não estão na planilha\n\nContinuar?')) {
      return;
    }

    setLoading(true);
    setImportStatus('🔄 Iniciando atualização inteligente do estoque...');

    try {
      const XLSX = await import('xlsx');
      
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('📋 Dados da planilha para atualização:', jsonData.length, 'linhas');
      
      if (jsonData.length === 0) {
        throw new Error('A planilha está vazia ou não contém dados válidos');
      }

      // Carregar veículos existentes do Firestore
      setImportStatus('📍 Carregando veículos existentes...');
      const vehiclesRef = collection(db, 'veiculos');
      const snapshot = await getDocs(vehiclesRef);
      const existingVehicles = {};
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Normalizar placa (remover traços, espaços)
        const placaNormalizada = (data.placa || '').toString().replace(/[-\s]/g, '').toLowerCase();
        const modeloNormalizado = (data.modelo || '').toString().toLowerCase();
        const anoNormalizado = (data.ano || data.ano_modelo || '').toString();
        
        // Chave principal
        const key = `${placaNormalizada}_${modeloNormalizado}_${anoNormalizado}`;
        existingVehicles[key] = { id: doc.id, data };
        
        // Chaves alternativas para melhor detecção
        if (placaNormalizada && anoNormalizado) {
          // Chave só com placa + ano (para modelos com nomes variáveis)
          const keyPlacaAno = `${placaNormalizada}_${anoNormalizado}`;
          existingVehicles[keyPlacaAno] = { id: doc.id, data };
          
          // Chave com modelo simplificado (remove "sport", "plus", etc.)
          const modeloSimplificado = modeloNormalizado
            .replace(/\s+(sport|plus|life|comfort|style|trend|titanium|sel|se)\b/g, '')
            .trim();
          if (modeloSimplificado !== modeloNormalizado) {
            const keySimplificada = `${placaNormalizada}_${modeloSimplificado}_${anoNormalizado}`;
            existingVehicles[keySimplificada] = { id: doc.id, data };
          }
        }
        
        // Log debug para Bronco
        if (data.modelo && data.modelo.toLowerCase().includes('bronco')) {
          console.log('🔍 BRONCO EXISTENTE encontrado:', {
            placa: data.placa,
            placa_normalizada: placaNormalizada,
            modelo: data.modelo,
            modelo_normalizado: modeloNormalizado,
            ano: data.ano,
            chave_principal: key,
            doc_id: doc.id
          });
        }
      });

      console.log('🗂️ Veículos existentes carregados:', Object.keys(existingVehicles).length);

      let updatedCount = 0;
      let createdCount = 0;
      let skippedCount = 0;
      let deletedCount = 0;
      
      // Rastrear veículos processados para exclusão posterior
      const processedVehicleIds = new Set();

      setImportStatus('🔄 Processando atualizações...');
      console.log('📋 INICIANDO IMPORTAÇÃO DE PLANILHA');
      console.log(`Total de linhas na planilha: ${jsonData.length}`);

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        // Processar fotos da planilha
        const processPhotos = () => {
          const photos = [];
          const mainImage = row['Imagem Principal'] || row['imagem_principal'] || '';
          if (mainImage && mainImage.trim()) {
            photos.push(mainImage.trim());
          }
          
          const additionalPhotos = row['Fotos'] || row['fotos'] || '';
          if (additionalPhotos && additionalPhotos.trim()) {
            const photoUrls = additionalPhotos.split(';').map(url => url.trim()).filter(url => url);
            photos.push(...photoUrls);
          }
          
          return [...new Set(photos)];
        };

        // Processar preço
        const processPrice = (priceStr) => {
          if (!priceStr) return 0;
          const cleanPrice = priceStr.toString()
            .replace(/R\$\s*/g, '')  // Remove R$ com espaços
            .replace(/[^\d,]/g, '')  // Remove tudo exceto dígitos e vírgula
            .replace(',', '.')       // Troca vírgula por ponto decimal
            .trim();
          return parseFloat(cleanPrice) || 0;
        };

        // Criar chave composta: placa_mascarada + modelo + ano_modelo
        const placa = (row.Placa || row.placa || '').toString().trim();
        const modelo = (row.Modelo || row.modelo || '').toString().trim();
        const ano = (row['Ano Modelo'] || row.ano_modelo || row.ano || '').toString().trim();
        
        if (!placa || !modelo || !ano) {
          console.log(`⚠️ Linha ${i + 1}: Dados incompletos (placa, modelo ou ano ausentes)`);
          skippedCount++;
          continue;
        }

        // SISTEMA DE DETECÇÃO INTELIGENTE
        const placaNormalizada = placa.replace(/[-\s]/g, '').toLowerCase();
        const modeloNormalizado = modelo.toLowerCase();
        const anoNormalizado = ano.toString();
        
        // Tentar múltiplas estratégias de matching
        let existingVehicle = null;
        let matchStrategy = '';
        
        // Estratégia 1: Chave exata
        const chaveExata = `${placaNormalizada}_${modeloNormalizado}_${anoNormalizado}`;
        existingVehicle = existingVehicles[chaveExata];
        if (existingVehicle) matchStrategy = 'exata';
        
        // Estratégia 2: Só placa + ano (para variações de modelo)
        if (!existingVehicle) {
          const chavePlacaAno = `${placaNormalizada}_${anoNormalizado}`;
          existingVehicle = existingVehicles[chavePlacaAno];
          if (existingVehicle) matchStrategy = 'placa+ano';
        }
        
        // Estratégia 3: Modelo simplificado (remove palavras como "sport")
        if (!existingVehicle) {
          const modeloSimplificado = modeloNormalizado
            .replace(/\s+(sport|plus|life|comfort|style|trend|titanium|sel|se)\b/g, '')
            .trim();
          const chaveSimplificada = `${placaNormalizada}_${modeloSimplificado}_${anoNormalizado}`;
          existingVehicle = existingVehicles[chaveSimplificada];
          if (existingVehicle) matchStrategy = 'modelo_simplificado';
        }
        
        // Log debug para Bronco
        if (modelo.toLowerCase().includes('bronco')) {
          console.log('🔍 BRONCO DA PLANILHA:', {
            placa_original: placa,
            placa_normalizada: placaNormalizada,
            modelo_original: modelo,
            modelo_normalizado: modeloNormalizado,
            ano: anoNormalizado,
            chave_exata: chaveExata,
            encontrado: !!existingVehicle,
            estrategia_usada: matchStrategy,
            chaves_bronco_existentes: Object.keys(existingVehicles).filter(k => k.includes('bronco'))
          });
        }

        const photosArray = processPhotos();
        const preco = processPrice(row.Preço || row.Preco || row.preco || 0);
        


        if (existingVehicle) {
          // VEÍCULO EXISTE - Atualizar apenas preço e fotos
          console.log(`🔄 Atualizando veículo existente (${matchStrategy}): ${placa} - ${modelo} ${ano}`);
          
          // PRESERVAR DADOS DA IA - Atualizar apenas preço, fotos e KM
          const updateData = {
            preco,
            photos: photosArray,
            imagens: photosArray, // Compatibilidade
            km: parseInt(row.KM) || existingVehicle.data.km || 0, // Atualizar KM se houver novo valor
            data_atualizacao: new Date().toISOString()
          };
          
          // CAMPOS PRESERVADOS (não sobrescrever):
          // - informacoes (descrição corrigida pela IA)
          // - especificacoes_tecnicas (specs técnicas da IA)
          // - equipamentos (equipamentos sugeridos pela IA)
          // - descricao_comercial (descrição comercial da IA)
          // - custom_tag (tags personalizadas)
          // - ai_processed (flag de processamento)
          // - ai_processed_fields (campos processados)
          


          await updateDoc(doc(db, 'veiculos', existingVehicle.id), updateData);
          updatedCount++;
          
          // Marcar como processado (não excluir)
          processedVehicleIds.add(existingVehicle.id);

        } else {
          // VEÍCULO NÃO EXISTE - Criar novo com dados completos
          console.log(`➕ Criando novo veículo: ${placa} - ${modelo} ${ano}`);
          
          const currentTime = new Date().toISOString();
          const newVehicleData = {
            vehicle_uuid: crypto.randomUUID(),
            placa,
            marca: (row.Marca || row.marca || '').toString().trim(),
            modelo,
            versao: (row['Versão'] || row.Versao || row.versao || '').toString().trim(),
            ano: parseInt(ano) || new Date().getFullYear(),
            ano_modelo: parseInt(ano) || new Date().getFullYear(),
            km: parseInt((row.KM || row.km || '0').toString().replace(/\D/g, '')) || 0,
            combustivel: (row.Combustível || row.Combustivel || row.combustivel || 'Flex').toString().trim(),
            cambio: (row.Câmbio || row.Cambio || row.cambio || 'Manual').toString().trim(),
            preco,
            cor: (row.Cor || row.cor || '').toString().trim(),
            photos: photosArray,
            imagens: photosArray,
            ativo: true,
            mais_vendidos: false,
            data_cadastro: currentTime,
            data_atualizacao: currentTime,
            timestamp: currentTime,
            created_at: currentTime,
            updated_at: currentTime
          };

          const newDocRef = await addDoc(collection(db, 'veiculos'), newVehicleData);
          createdCount++;
          
          // Marcar como processado (não excluir)
          processedVehicleIds.add(newDocRef.id);
        }

        // Atualizar progresso
        if ((i + 1) % 10 === 0) {
          setImportStatus(`🔄 Processando: ${i + 1}/${jsonData.length} veículos...`);
        }
      }

      // EXCLUIR veículos que não estão na planilha
      setImportStatus('🗑️ Removendo veículos não presentes na planilha...');
      
      const vehiclesToDelete = Object.values(existingVehicles)
        .filter(vehicle => !processedVehicleIds.has(vehicle.id))
        .reduce((unique, vehicle) => {
          // Evitar duplicatas (mesmo veículo pode ter múltiplas chaves)
          if (!unique.find(v => v.id === vehicle.id)) {
            unique.push(vehicle);
          }
          return unique;
        }, []);
      
      console.log(`🗑️ Veículos para exclusão: ${vehiclesToDelete.length}`);
      
      for (const vehicleToDelete of vehiclesToDelete) {
        try {
          console.log(`🗑️ Excluindo: ${vehicleToDelete.data.marca} ${vehicleToDelete.data.modelo} - ${vehicleToDelete.data.placa}`);
          await deleteDoc(doc(db, 'veiculos', vehicleToDelete.id));
          deletedCount++;
        } catch (error) {
          console.error(`❌ Erro ao excluir veículo ${vehicleToDelete.id}:`, error);
        }
      }

      setImportStatus(`✅ Atualização concluída: ${updatedCount} atualizados, ${createdCount} criados, ${deletedCount} excluídos, ${skippedCount} ignorados`);
      showToast(`Atualização concluída! ${updatedCount} atualizados, ${createdCount} novos, ${deletedCount} excluídos`, 'success');
      
      // Recarregar dados
      await loadFirestoreVehicles();

    } catch (error) {
      console.error('❌ Erro na atualização inteligente:', error);
      setImportStatus('❌ Erro na atualização do estoque');
      showToast('Erro na atualização do estoque: ' + error.message, 'error');
    } finally {
      setLoading(false);
      setTimeout(() => setImportStatus(''), 5000);
    }
  };

  // Função para limpar o banco de dados
  const handleClearDatabase = async () => {
    if (!confirm('⚠️ ATENÇÃO: Esta ação irá REMOVER TODOS os veículos do banco de dados permanentemente. Tem certeza que deseja continuar?')) {
      return;
    }

    setLoading(true);
    setImportStatus('🗑️ Limpando banco de dados...');
    
    try {
      console.log('Iniciando limpeza do banco de dados...');
      const vehiclesRef = collection(db, 'veiculos');
      const snapshot = await getDocs(vehiclesRef);
      
      const deletePromises = [];
      snapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(deletePromises);
      
      console.log(`✅ ${deletePromises.length} veículos removidos do banco`);
      setImportStatus(`✅ Banco limpo com sucesso! ${deletePromises.length} veículos removidos.`);
      setFirestoreVehicles([]);
      setBestSellersVehicles([]);
      showToast('Banco de dados limpo com sucesso!', 'success');
      
    } catch (error) {
      console.error('❌ Erro ao limpar banco:', error);
      setImportStatus(`❌ Erro ao limpar banco: ${error.message}`);
      showToast('Erro ao limpar banco de dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Função para processar planilha Excel
  const handleProcessSpreadsheet = async () => {
    if (!selectedFile) {
      showToast('Selecione um arquivo primeiro', 'error');
      return;
    }

    if (!confirm('⚠️ ATENÇÃO: Esta ação irá SUBSTITUIR TODOS os veículos existentes pelos dados da planilha. Tem certeza que deseja continuar?')) {
      return;
    }

    setLoading(true);
    setImportStatus('📊 Processando planilha Excel...');
    
    try {
      // Importar biblioteca XLSX dinamicamente
      const XLSX = await import('xlsx');
      
      // Ler arquivo Excel
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Converter para JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log('📋 Dados da planilha:', jsonData.length, 'linhas');
      
      if (jsonData.length === 0) {
        throw new Error('A planilha está vazia ou não contém dados válidos');
      }

      setImportStatus('🗑️ Limpando banco antes da importação...');
      
      // Limpar banco existente
      const vehiclesRef = collection(db, 'veiculos');
      const snapshot = await getDocs(vehiclesRef);
      const deletePromises = [];
      snapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      await Promise.all(deletePromises);
      
      setImportStatus('📤 Importando novos veículos...');
      
      // Processar e importar novos dados
      const processedVehicles = [];
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        // Processar fotos da planilha
        const processPhotos = () => {
          const photos = [];
          
          // Adicionar imagem principal se existir
          const mainImage = row['Imagem Principal'] || row['imagem_principal'] || '';
          if (mainImage && mainImage.trim()) {
            photos.push(mainImage.trim());
          }
          
          // Processar múltiplas fotos (separadas por ponto e vírgula)
          const additionalPhotos = row['Fotos'] || row['fotos'] || '';
          if (additionalPhotos && additionalPhotos.trim()) {
            const photoUrls = additionalPhotos.split(';').map(url => url.trim()).filter(url => url);
            photos.push(...photoUrls);
          }
          
          // Remover duplicatas mantendo ordem
          return [...new Set(photos)];
        };
        
        // Processar preço (remover formatação brasileira)
        const processPrice = (priceStr) => {
          if (!priceStr) return 0;
          const cleanPrice = priceStr.toString()
            .replace(/R\$\s*/g, '')  // Remove R$ com espaços
            .replace(/[^\d,]/g, '')  // Remove tudo exceto dígitos e vírgula
            .replace(',', '.')       // Substitui vírgula por ponto decimal
            .trim();
          return parseFloat(cleanPrice) || 0;
        };
        
        // Processar tipo de anúncio para tag personalizada
        const processCustomTag = (tipoAnuncio) => {
          if (!tipoAnuncio) return null;
          const tipo = tipoAnuncio.toString().toLowerCase();
          
          if (tipo.includes('destaque')) return 'destaque';
          if (tipo.includes('promoção') || tipo.includes('promocao')) return 'promocao';
          if (tipo.includes('oferta')) return 'oferta_especial';
          if (tipo.includes('seminovo')) return 'seminovo';
          
          return null;
        };

        // Processar opcionais da planilha
        const processOptionals = () => {
          const optionals = row.Opcionais || row.opcionais || '';
          if (!optionals || !optionals.trim()) return {};
          
          // Dividir opcionais por vírgula e categorizar automaticamente
          const items = optionals.split(',').map(item => item.trim()).filter(item => item);
          
          // Categorização automática básica (será refinada pela IA depois)
          const equipamentos = {
            INTERIOR: [],
            EXTERIOR: [],
            SEGURANÇA: [],
            CONFORTO: []
          };
          
          items.forEach(item => {
            const itemLower = item.toLowerCase();
            
            // INTERIOR
            if (itemLower.includes('bancos') || itemLower.includes('central multimídia') || 
                itemLower.includes('cd player') || itemLower.includes('usb') ||
                itemLower.includes('bluetooth')) {
              equipamentos.INTERIOR.push(item);
            }
            // EXTERIOR  
            else if (itemLower.includes('rodas') || itemLower.includes('teto solar') ||
                     itemLower.includes('limpador') || itemLower.includes('retrovisores')) {
              equipamentos.EXTERIOR.push(item);
            }
            // SEGURANÇA
            else if (itemLower.includes('alarme') || itemLower.includes('freios') ||
                     itemLower.includes('abs') || itemLower.includes('airbag') ||
                     itemLower.includes('câmera') || itemLower.includes('sensor')) {
              equipamentos.SEGURANÇA.push(item);
            }
            // CONFORTO
            else if (itemLower.includes('ar condicionado') || itemLower.includes('direção') ||
                     itemLower.includes('vidros') || itemLower.includes('travas') ||
                     itemLower.includes('piloto') || itemLower.includes('gps')) {
              equipamentos.CONFORTO.push(item);
            }
            // Default para CONFORTO se não se encaixa em nenhuma categoria
            else {
              equipamentos.CONFORTO.push(item);
            }
          });
          
          return equipamentos;
        };
        
        // Processar cada linha da planilha
        const currentTime = new Date().toISOString();
        const vehicle = {
          vehicle_uuid: `AUTO_${Date.now()}_${i}`,
          marca: row.Marca || row.marca || '',
          modelo: row.Modelo || row.modelo || '',
          versao: row.Versao || row.versao || row.Versão || '',
          ano: parseInt(row['Ano Modelo'] || row['ano_modelo'] || row.Ano || row.ano || 0),
          ano_fabricacao: parseInt(row['Ano Fabricação'] || row['ano_fabricacao'] || 0),
          preco: processPrice(row.Preço || row.Preco || row.preco),
          km: parseInt(row.KM || row.Km || row.km || 0),
          combustivel: row.Combustível || row.Combustivel || row.combustivel || '',
          cambio: row.Câmbio || row.Cambio || row.cambio || '',
          cor: row.Cor || row.cor || '',
          portas: parseInt(row.Portas || row.portas || 0),
          placa: row.Placa || row.placa || '',
          
          // Fotos processadas da planilha
          photos: processPhotos(),
          imagens: processPhotos(), // Compatibilidade com sistema existente
          
          // Informações adicionais da planilha
          informacoes: row.Descrição || row.Descricao || row.descricao || '',
          // Tags serão definidas manualmente no admin usando tags personalizadas
          
          // Status padrão
          ativo: row.Ativo === 'true' || row.Ativo === true || row.ativo === true || true,
          mais_vendidos: false,
          mostrar_de_por: false,
          
          // Opcionais processados da planilha
          equipamentos: processOptionals(),
          opcionais_originais_planilha: row.Opcionais || row.opcionais || '',
          
          // Campos para IA completar depois
          especificacoes_tecnicas: {},
          descricao_original_planilha: row.Descrição || row.Descricao || row.descricao || '',
          
          // Metadados com campos de data múltiplos
          data_importacao: new Date(),
          data_cadastro: currentTime,
          data_atualizacao: currentTime,
          timestamp: currentTime,
          created_at: currentTime,
          updated_at: currentTime,
          importado_de_planilha: true
        };
        
        processedVehicles.push(vehicle);
      }
      
      // Salvar no Firestore
      const savePromises = processedVehicles.map(vehicle => 
        setDoc(doc(db, 'veiculos', vehicle.vehicle_uuid), vehicle)
      );
      
      await Promise.all(savePromises);
      
      console.log(`✅ ${processedVehicles.length} veículos importados com sucesso`);
      setImportStatus(`✅ Importação concluída! ${processedVehicles.length} veículos processados e salvos no banco.`);
      
      // Recarregar dados
      await loadFirestoreVehicles();
      
      showToast(`${processedVehicles.length} veículos importados com sucesso!`, 'success');
      setSelectedFile(null); // Limpar seleção
      
    } catch (error) {
      console.error('❌ Erro ao processar planilha:', error);
      setImportStatus(`❌ Erro ao processar planilha: ${error.message}`);
      showToast('Erro ao processar planilha', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Função para filtrar veículos na tabela
  const getFilteredVehicles = () => {
    return firestoreVehicles.filter(vehicle => {
      const matchesSearch = !filters.search || 
        vehicle.marca?.toLowerCase().includes(filters.search.toLowerCase()) ||
        vehicle.modelo?.toLowerCase().includes(filters.search.toLowerCase()) ||
        vehicle.versao?.toLowerCase().includes(filters.search.toLowerCase()) ||
        vehicle.placa?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesBrand = !filters.brand || vehicle.marca === filters.brand;
      
      const matchesStatus = !filters.status || 
        (filters.status === 'ativo' && vehicle.ativo) ||
        (filters.status === 'inativo' && !vehicle.ativo) ||
        (filters.status === 'mais_vendidos' && vehicle.mais_vendidos);
      
      return matchesSearch && matchesBrand && matchesStatus;
    });
  };

  // Função para alterar status do veículo (ativo/mais_vendidos)
  const toggleVehicleStatus = async (vehicleId, field, newValue) => {
    try {
      // Usar o ID do documento ao invés de vehicle_uuid
      const vehicleRef = doc(db, 'veiculos', vehicleId);
      await updateDoc(vehicleRef, {
        [field]: newValue
      });
      
      // Atualizar estado local
      setFirestoreVehicles(prev => 
        prev.map(vehicle => 
          vehicle.id === vehicleId 
            ? { ...vehicle, [field]: newValue }
            : vehicle
        )
      );
      
      // Se for alteração em mais_vendidos, recarregar lista
      if (field === 'mais_vendidos') {
        await loadBestSellersVehicles();
      }
      
      showToast(`Status ${field === 'ativo' ? 'ativo' : 'mais vendidos'} atualizado!`, 'success');
      
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showToast('Erro ao atualizar status', 'error');
    }
  };

  // Função para abrir modal de edição
  const openEditModal = (vehicle) => {
    // Resetar flags da IA para nova sessão de edição
    setAiWasUsed(false);
    setAiSuggestions({});
    console.log('🔄 Resetando flags de IA para nova edição');
    
    setEditForm({
      id: vehicle.id,  // IMPORTANTE: ID do documento no Firestore
      vehicle_uuid: vehicle.vehicle_uuid,
      marca: vehicle.marca || '',
      modelo: vehicle.modelo || '',
      versao: vehicle.versao || '',
      ano: vehicle.ano || '',
      preco: vehicle.preco || '',
      preco_de: vehicle.preco_de || '',
      km: vehicle.km || '',
      combustivel: vehicle.combustivel || '',
      cambio: vehicle.cambio || '',
      placa: vehicle.placa || '',
      ativo: vehicle.ativo || false,
      mais_vendidos: vehicle.mais_vendidos || false,
      mostrar_de_por: vehicle.mostrar_de_por || false,
      tag: vehicle.tag || vehicle.custom_tag || null,
      photos: vehicle.photos || vehicle.imagens || [],
      equipamentos: vehicle.equipamentos || {},
      informacoes: vehicle.informacoes || '',
      especificacoes_tecnicas: vehicle.especificacoes_tecnicas || {},
      categoria: vehicle.categoria || vehicle.tipo_veiculo || vehicle.especificacoes_tecnicas?.tipo_veiculo || ''
    });
    setShowEditModal(true);
  };

  // Função para salvar alterações do veículo
  const saveVehicleChanges = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 DEBUG - Salvando veículo:', {
        id: editForm.id,
        vehicle_uuid: editForm.vehicle_uuid,
        marca: editForm.marca,
        modelo: editForm.modelo
      });
      
      // Verificar se o ID está presente
      if (!editForm.id) {
        throw new Error('ID do documento não encontrado. Por favor, feche e abra novamente o modal de edição.');
      }
      
      // Verificar se o documento existe antes de salvar
      const vehicleRef = doc(db, 'veiculos', editForm.id);  // Usar o ID do documento, não o UUID
      const vehicleDoc = await getDoc(vehicleRef);
      
      if (!vehicleDoc.exists()) {
        throw new Error(`Documento não encontrado: ${editForm.id}`);
      }

      // 🤖 DETECTAR SE DADOS FORAM GERADOS POR IA
      const hasAiGeneratedContent = () => {
        // 1. PRIORIDADE: Se IA foi usada nesta sessão
        if (aiWasUsed) {
          console.log('🤖 IA foi usada nesta sessão - forçando preenchidoIA=true');
          return true;
        }
        
        // 2. Verificar se campos de especificações técnicas estão preenchidos (indicativo de IA)
        const techSpecs = editForm.especificacoes_tecnicas || {};
        const aiTechFields = ['potencia_maxima', 'torque_maximo', 'consumo_urbano', 'consumo_rodoviario', 'autonomia_urbana', 'autonomia_rodoviaria'];
        const hasAiTechData = aiTechFields.some(field => techSpecs[field] && techSpecs[field].toString().trim() !== '');
        
        // 3. Verificar se informações foram preenchidas com conteúdo substancial (indicativo de IA)
        const hasDetailedInfo = editForm.informacoes && editForm.informacoes.length > 200;
        
        // 4. Verificar se equipamentos estão organizados em categorias (indicativo de IA)
        const hasOrganizedEquipments = editForm.equipamentos && 
          typeof editForm.equipamentos === 'object' && 
          (editForm.equipamentos.INTERIOR || editForm.equipamentos.EXTERIOR || 
           editForm.equipamentos.SEGURANÇA || editForm.equipamentos.CONFORTO);
        
        console.log('🔍 Verificando conteúdo IA:', {
          aiWasUsed,
          hasAiTechData,
          hasDetailedInfo,
          hasOrganizedEquipments,
          techSpecs: Object.keys(techSpecs),
          infoLength: editForm.informacoes?.length || 0
        });
        
        return hasAiTechData || hasDetailedInfo || hasOrganizedEquipments;
      };

      const shouldSetPreenchidoIA = hasAiGeneratedContent();
      console.log('🤖 Definir preenchidoIA como:', shouldSetPreenchidoIA);

      const updateData = {
        marca: editForm.marca,
        modelo: editForm.modelo,
        versao: editForm.versao,
        ano: parseInt(editForm.ano) || 0,
        preco: parseFloat(editForm.preco) || 0,
        preco_de: parseFloat(editForm.preco_de) || 0,
        km: parseInt(editForm.km) || 0,
        combustivel: editForm.combustivel,
        cambio: editForm.cambio,
        placa: editForm.placa,
        ativo: editForm.ativo,
        mais_vendidos: editForm.mais_vendidos,
        mostrar_de_por: editForm.mostrar_de_por,
        custom_tag: editForm.tag || null,  // Usar custom_tag ao invés de tag
        photos: editForm.photos,
        equipamentos: editForm.equipamentos,
        informacoes: editForm.informacoes,
        especificacoes_tecnicas: editForm.especificacoes_tecnicas,
        data_atualizacao: new Date()
      };

      // Adicionar flag preenchidoIA se conteúdo foi gerado por IA
      if (shouldSetPreenchidoIA) {
        updateData.preenchidoIA = true;
        updateData.data_atualizacao_ia = new Date();
        console.log('✅ PreenchidoIA definido como true - conteúdo IA detectado');
      }

      console.log('📝 Tentando salvar no Firestore com updateData:', updateData);
      
      try {
        await updateDoc(vehicleRef, updateData);
        console.log('✅ Dados salvos com sucesso no Firestore');
      } catch (firestoreError) {
        console.error('❌ Erro específico do Firestore:', firestoreError);
        console.error('❌ Detalhes do erro:', {
          code: firestoreError.code,
          message: firestoreError.message,
          stack: firestoreError.stack
        });
        throw firestoreError;
      }
      
      // Atualizar estado local
      setFirestoreVehicles(prev => 
        prev.map(vehicle => 
          vehicle.id === editForm.id  // Usar ID do documento
            ? { 
                ...vehicle, 
                ...editForm,
                preenchidoIA: shouldSetPreenchidoIA || vehicle.preenchidoIA,
                data_atualizacao_ia: shouldSetPreenchidoIA ? new Date() : vehicle.data_atualizacao_ia
              }
            : vehicle
        )
      );
      
      setShowEditModal(false);
      
      if (shouldSetPreenchidoIA) {
        showToast('Veículo atualizado com sucesso! IA detectada - marcado como processado.', 'success');
      } else {
        showToast('Veículo atualizado com sucesso!', 'success');
      }
      
      // Recarregar listas se necessário
      if (editForm.mais_vendidos) {
        await loadBestSellersVehicles();
      }
      
    } catch (error) {
      console.error('❌ Erro geral ao salvar alterações:', error);
      console.error('❌ Tipo do erro:', error.constructor.name);
      console.error('❌ Mensagem do erro:', error.message);
      
      // Mensagem de erro mais específica
      let errorMessage = 'Erro ao salvar alterações';
      if (error.message.includes('ID do documento não encontrado')) {
        errorMessage = error.message;
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Erro de permissão ao salvar no banco de dados';
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Função para correção automática de dados com IA (IGNORA TAGS COMPLETAMENTE)
  const generateCompleteInformation = async () => {
    if (!editForm.marca || !editForm.modelo) {
      showToast('Preencha marca e modelo antes de usar a IA', 'error');
      return;
    }

    setGeneratingAi(true);
    try {
      console.log('🚀 Iniciando correção automática com IA');
      console.log('📍 Endpoint:', '/openai');
      console.log('📋 Dados do veículo:', { marca: editForm.marca, modelo: editForm.modelo });
      
      const response = await fetch('/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Você é um especialista automotivo e redator comercial brasileiro. Seu papel é corrigir, completar e padronizar os dados de um veículo seminovo para uma plataforma de vendas como a Kavak ou CarMax.

Sua missão é gerar informações confiáveis e ao mesmo tempo extremamente persuasivas para o cliente final, aumentando o interesse e ajudando na indexação SEO (sem exageros ou termos genéricos).

🔧 DADOS DO VEÍCULO (para corrigir):
Marca: ${editForm.marca}
Modelo: ${editForm.modelo}
Versão: ${editForm.versao || 'Não informada'}
Ano: ${editForm.ano || 'Não informado'}
Preço: ${editForm.preco ? parseFloat(editForm.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não informado'}
Combustível: ${editForm.combustivel || 'Não informado'}
Transmissão: ${editForm.cambio || 'Não informada'}
Quilometragem: ${editForm.km || 'Não informada'} km
Placa: ${editForm.placa || 'Não informada'}
Categoria: ${editForm.categoria || editForm.tipo_veiculo || 'Não informada'}
Descrição: ${editForm.informacoes || 'Não informada'}
Opcionais: ${JSON.stringify(editForm.equipamentos) || 'Não informados'}

🎯 TAREFAS

✅ Corrigir Marca, Modelo e Versão
- Padronizar nomes corretos e oficiais
- Garantir que marca e modelo combinem corretamente
- Versão com formatação correta, sem duplicidade

✅ Padronizar Combustível e Transmissão
- Combustível: Flex, Gasolina, Diesel, Elétrico, Híbrido
- Câmbio: Manual, Automático, CVT

✅ Identificar Categoria de Veículo CORRETA (OBRIGATÓRIO)
- Volkswagen Tiguan = SUV (não sedan ou hatch)
- Ford Ka = Hatch
- Honda City = Sedan  
- Chevrolet Onix = Hatch
- Jeep Renegade = SUV
- Fiat Toro = Pick-up
- SEMPRE identificar a categoria correta baseada no modelo real

✅ Corrigir e melhorar Descrição (MÍNIMO 6 LINHAS / 200 palavras)
- A descrição deve ser comercial, fluida, persuasiva e engajadora
- PELO MENOS 6 LINHAS de texto corrido
- Foque no perfil do comprador e benefícios práticos do ${editForm.marca} ${editForm.modelo}
- Destaque economia de combustível, praticidade urbana, segurança e confiabilidade
- Use linguagem clara e atraente, com foco em experiência de uso real
- Mencione principais características técnicas e diferenciais do modelo

✅ Organizar e Corrigir Opcionais (OBRIGATÓRIO: 5 ITENS POR CATEGORIA)
- Separar em: INTERIOR, EXTERIOR, SEGURANÇA, CONFORTO
- CADA categoria deve ter EXATAMENTE 5 itens válidos (não menos, não mais)
- Se não souber 5 itens específicos do modelo, use equipamentos comuns mas plausíveis
- ESTRUTURA OBRIGATÓRIA:
  * INTERIOR: ["item1", "item2", "item3", "item4", "item5"]
  * EXTERIOR: ["item1", "item2", "item3", "item4", "item5"] 
  * SEGURANÇA: ["item1", "item2", "item3", "item4", "item5"]
  * CONFORTO: ["item1", "item2", "item3", "item4", "item5"]

EXEMPLOS OBRIGATÓRIOS para completar 5 itens:
- INTERIOR: Ar-condicionado, Direção elétrica, Vidros elétricos, Central multimídia, Computador de bordo
- EXTERIOR: Rodas de liga leve, Faróis de neblina, Retrovisores elétricos, Para-choques na cor, Maçanetas na cor
- SEGURANÇA: Airbags frontais, ABS + EBD, Controle de estabilidade, Alarme, Travas elétricas  
- CONFORTO: Banco regulável, Apoio de braço, Porta-objetos, Entrada USB, Bluetooth

❌ REJEITADO: Qualquer categoria com menos de 5 itens será considerada ERRO GRAVE

✅ Preencher Especificações Técnicas (OBRIGATÓRIO - NUNCA VAZIO)
- TODOS os campos devem ter valores numéricos reais do ${editForm.marca} ${editForm.modelo} ${editForm.ano || ''}
- comprimento: tamanho em mm (ex: "4200")
- largura: largura em mm (ex: "1700") 
- altura: altura em mm (ex: "1500")
- porta_malas: capacidade litros (ex: "300")
- capacidade: pessoas (ex: "5")
- peso: peso kg (ex: "1200")
- potencia_maxima: potência em cv (ex: "139")
- torque_maximo: torque em kgfm com vírgula decimal (ex: "19,3")
- consumo_urbano: consumo cidade km/l com vírgula decimal (ex: "9,1")
- consumo_rodoviario: consumo estrada km/l com vírgula decimal (ex: "11,7")
- autonomia_urbana: autonomia cidade km (ex: "430")
- autonomia_rodoviaria: autonomia estrada km (ex: "550")
- RETORNAR APENAS NÚMEROS SEM UNIDADES
- USE VÍRGULA COMO SEPARADOR DECIMAL para torque, consumo urbano e rodoviário
- ❌ NUNCA retornar campos vazios "" - SEMPRE preencher com dados reais

⚠️ REGRAS ABSOLUTAS - FALHA = REJEIÇÃO TOTAL
❌ Não gerar ou mencionar tags
❌ Não inventar opcionais que não combinam com o modelo/ano
❌ Não duplicar a categoria de veículo nas especificações
❌ Não preencher campos com dados fantasiosos
❌ Não gerar textos técnicos demais
❌ ERRO GRAVE: Menos de 5 itens em qualquer categoria de opcionais
❌ ERRO GRAVE: Errar categoria de veículo (Tiguan=SUV, Ka=Hatch, City=Sedan)
❌ ERRO GRAVE: Deixar qualquer array de opcionais com menos de 5 strings
❌ ERRO GRAVE: Não seguir a estrutura ["item1", "item2", "item3", "item4", "item5"]

🚨 VALIDAÇÃO AUTOMÁTICA: A resposta será rejeitada se qualquer categoria tiver ≠ 5 itens

✅ EXEMPLO DE RESPOSTA CORRETA (Volkswagen Tiguan 2019):
{
  "marca_corrigida": "Volkswagen",
  "modelo_corrigido": "Tiguan",
  "versao_corrigida": "Allspace Comfortline 1.4 TSI",
  "categoria_corrigida": "SUV",
  "combustivel_corrigido": "Flex",
  "cambio_corrigido": "Automático",
  "descricao_corrigida": "O Volkswagen Tiguan Allspace oferece o melhor dos dois mundos: o conforto e a dirigibilidade de um carro de passeio com a robustez e versatilidade de um SUV. Com seu motor 1.4 TSI turbo e câmbio automático de 6 marchas, proporciona performance eficiente e suave em qualquer situação. O amplo espaço interno acomoda confortavelmente até 7 pessoas, enquanto o porta-malas generoso atende todas as necessidades familiares. Equipado com tecnologias avançadas de segurança e conectividade, o Tiguan garante tranquilidade e praticidade no dia a dia urbano e nas aventuras de fim de semana.",
  "opcionais_corrigidos": {
    "INTERIOR": ["Ar-condicionado automático digital", "Central multimídia com tela touch", "Volante multifuncional em couro", "Bancos em couro", "Computador de bordo"],
    "EXTERIOR": ["Rodas de liga leve 17\"", "Faróis de LED", "Retrovisores elétricos", "Teto solar panorâmico", "Proteções laterais"],
    "SEGURANÇA": ["6 Airbags", "ABS + EBD + ESP", "Controle de estabilidade", "Alarme antifurto", "Travamento automático"],
    "CONFORTO": ["Piloto automático", "Sensor de estacionamento", "Câmera de ré", "Entrada USB", "Bluetooth"]
  },
  "especificacoes_tecnicas": {
    "comprimento": "4486",
    "largura": "1839",
    "altura": "1632",
    "porta_malas": "230",
    "capacidade": "7",
    "peso": "1685",
    "potencia_maxima": "139",
    "torque_maximo": "19,3",
    "consumo_urbano": "9,1",
    "consumo_rodoviario": "11,7",
    "autonomia_urbana": "430",
    "autonomia_rodoviaria": "550"
  },
  "sugestoes_correcao": []
}

🔥 ESTRUTURA JSON OBRIGATÓRIA - COPIE EXATAMENTE:
{
  "marca_corrigida": "string",
  "modelo_corrigido": "string", 
  "versao_corrigida": "string",
  "categoria_corrigida": "string",
  "combustivel_corrigido": "string",
  "cambio_corrigido": "string",
  "descricao_corrigida": "string com 6+ linhas",
  "opcionais_corrigidos": {
    "INTERIOR": ["item1", "item2", "item3", "item4", "item5"],
    "EXTERIOR": ["item1", "item2", "item3", "item4", "item5"],
    "SEGURANÇA": ["item1", "item2", "item3", "item4", "item5"],
    "CONFORTO": ["item1", "item2", "item3", "item4", "item5"]
  },
  "especificacoes_tecnicas": {
    "comprimento": "numero",
    "largura": "numero",
    "altura": "numero", 
    "porta_malas": "numero",
    "capacidade": "numero",
    "peso": "numero",
    "potencia_maxima": "numero",
    "torque_maximo": "numero_com_virgula",
    "consumo_urbano": "numero_com_virgula",
    "consumo_rodoviario": "numero_com_virgula",
    "autonomia_urbana": "numero",
    "autonomia_rodoviaria": "numero"
  },
  "sugestoes_correcao": []
}

🚨 VALIDAÇÃO: Conte os itens - cada array deve ter EXATAMENTE 5 elementos!`
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite de uso da IA atingido. Tente novamente mais tarde.');
        }
        if (response.status === 401) {
          throw new Error('Chave da API OpenAI inválida ou não configurada.');
        }
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        throw new Error(`Erro ao conectar com o serviço de IA: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📥 Resposta raw da IA:', data);
      
      const aiData = JSON.parse(data.content);
      console.log('🧠 Dados processados da IA:', aiData);
      console.log('🔧 Especificações técnicas da IA:', aiData.especificacoes_tecnicas);

      // Aplicar correções da IA ao formulário (SEM TOCAR EM TAGS)
      setEditForm(prev => ({
        ...prev,
        marca: aiData.marca_corrigida || prev.marca,
        modelo: aiData.modelo_corrigido || prev.modelo,
        versao: aiData.versao_corrigida || prev.versao,
        categoria: aiData.categoria_corrigida || prev.categoria || prev.tipo_veiculo,
        combustivel: aiData.combustivel_corrigido || prev.combustivel,
        cambio: aiData.cambio_corrigido || prev.cambio,
        informacoes: aiData.descricao_corrigida || prev.informacoes,
        equipamentos: aiData.opcionais_corrigidos || prev.equipamentos,
        especificacoes_tecnicas: {
          ...prev.especificacoes_tecnicas,
          ...Object.fromEntries(
            Object.entries(aiData.especificacoes_tecnicas || {}).map(([key, value]) => [
              key, 
              typeof value === 'string' ? value.replace(/\s*(mm|litros|kg|lugares)\s*$/i, '') : value
            ])
          )
        }
        // Tags mantidas inalteradas - apenas tags personalizadas são válidas
      }));

      // Marcar campos como corrigidos por IA
      setAiSuggestions({
        marca: true,
        modelo: true,
        versao: true,
        categoria: true,
        combustivel: true,
        cambio: true,
        informacoes: true,
        equipamentos: true,
        especificacoes_tecnicas: true
      });

      // 🤖 MARCAR QUE IA FOI USADA NESTA SESSÃO
      setAiWasUsed(true);
      console.log('🤖 IA foi usada - marcando para salvar como processado');

      // Salvar automaticamente as correções no Firestore
      try {
        console.log('💾 Iniciando salvamento automático...');
        console.log('🆔 Vehicle UUID:', editForm.vehicle_uuid);
        
        // Verificar se o documento existe antes de tentar atualizar
        const vehicleRef = doc(db, 'veiculos', editForm.vehicle_uuid);
        const vehicleDoc = await getDoc(vehicleRef);
        
        if (!vehicleDoc.exists()) {
          throw new Error(`Documento não encontrado: ${editForm.vehicle_uuid}`);
        }
        
        console.log('✅ Documento encontrado, iniciando update...');
        
        const updateData = {
          marca: aiData.marca_corrigida || editForm.marca,
          modelo: aiData.modelo_corrigido || editForm.modelo,
          versao: aiData.versao_corrigida || editForm.versao,
          categoria: aiData.categoria_corrigida || editForm.categoria || editForm.tipo_veiculo,
          combustivel: aiData.combustivel_corrigido || editForm.combustivel,
          cambio: aiData.cambio_corrigido || editForm.cambio,
          informacoes: aiData.descricao_corrigida || editForm.informacoes,
          equipamentos: aiData.opcionais_corrigidos || editForm.equipamentos,
          especificacoes_tecnicas: {
            ...editForm.especificacoes_tecnicas,
            ...Object.fromEntries(
              Object.entries(aiData.especificacoes_tecnicas || {}).map(([key, value]) => [
                key, 
                typeof value === 'string' ? value.replace(/\s*(mm|litros|kg|lugares)\s*$/i, '') : value
              ])
            )
          },
          // SALVAR TAMBÉM COM NOMES ALTERNATIVOS PARA GARANTIR COMPATIBILIDADE
          combustivel_corrigido: aiData.combustivel_corrigido || editForm.combustivel,
          cambio_corrigido: aiData.cambio_corrigido || editForm.cambio,
          descricao_corrigida: aiData.descricao_corrigida || editForm.informacoes,
          opcionais_corrigidos: aiData.opcionais_corrigidos || editForm.equipamentos,
          preenchidoIA: true,
          data_atualizacao_ia: new Date(),
          data_atualizacao: new Date().toISOString()
        };
        
        console.log('📝 Dados para salvar:', updateData);
        console.log('📝 DEBUG - informacoes sendo salva:', updateData.informacoes);
        console.log('📝 DEBUG - aiData.descricao_corrigida:', aiData.descricao_corrigida);
        
        await updateDoc(vehicleRef, updateData);
        console.log('✅ UpdateDoc executado com sucesso!');

        showToast('✅ IA corrigiu e salvou: marca, modelo, versão, tipo, combustível, transmissão e descrição!', 'success');
        
        // Recarregar os dados do veículo para mostrar as mudanças
        await loadFirestoreVehicles();
        
        // Fechar e reabrir o modal para mostrar dados atualizados
        setShowEditModal(false);
        setTimeout(() => {
          setEditForm(prev => ({
            ...prev,
            ...updateData
          }));
          setShowEditModal(true);
        }, 100);
        
        // Mostrar sugestões de correção se disponíveis
        if (aiData.sugestoes_correcao && aiData.sugestoes_correcao.length > 0) {
          console.log('Correções aplicadas pela IA:', aiData.sugestoes_correcao);
        }

      } catch (saveError) {
        console.error('Erro ao salvar correções:', saveError);
        showToast('IA corrigiu os dados, mas erro ao salvar no banco', 'error');
      }

    } catch (error) {
      console.error('❌ Erro completo na correção IA:', error);
      console.error('❌ Stack:', error.stack);
      console.error('❌ Tipo de erro:', error.name);
      showToast(error.message || 'Erro ao corrigir dados com IA', 'error');
    } finally {
      setGeneratingAi(false);
    }
  };

  // Função para processamento em lote via IA
  const handleProcessamentoLoteIA = async () => {
    console.log('🚀 Iniciando processamento em lote com IA');
    
    // Buscar veículos não processados
    const veiculosPendentes = firestoreVehicles.filter(v => !v.preenchidoIA);
    console.log(`📋 Veículos pendentes: ${veiculosPendentes.length}`);
    
    if (veiculosPendentes.length === 0) {
      showToast('Todos os veículos já foram processados pela IA', 'info');
      return;
    }

    // Confirmação
    const confirmar = window.confirm(
      `Deseja preencher automaticamente os veículos pendentes com IA?\n\n` +
      `Isso afetará ${veiculosPendentes.length} veículo(s).\n\n` + 
      `O processo pode levar alguns minutos.`
    );

    if (!confirmar) {
      console.log('❌ Processamento cancelado pelo usuário');
      return;
    }

    console.log('✅ Processamento confirmado, iniciando...');

    setProcessandoLoteIA(true);
    setProgressoIA({
      atual: 0,
      total: veiculosPendentes.length,
      veiculoAtual: ''
    });

    let processados = 0;
    let erros = 0;

    for (const vehicle of veiculosPendentes) {
      try {
        // Verificar se o veículo tem ID válido
        if (!vehicle.vehicle_uuid) {
          console.error('❌ Veículo sem vehicle_uuid:', vehicle);
          erros++;
          continue;
        }
        
        setProgressoIA(prev => ({
          ...prev,
          atual: processados + 1,
          veiculoAtual: `${vehicle.marca} ${vehicle.modelo} - ${vehicle.placa}`
        }));

        console.log(`\n🚗 Processando veículo ${processados + 1}/${veiculosPendentes.length}:`, {
          id: vehicle.id,  // ID do documento no Firestore
          uuid: vehicle.vehicle_uuid,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          placa: vehicle.placa
        });

        // Processar com a IA
        console.log('📡 Chamando API da OpenAI...');
        const response = await fetch('/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `Você é um especialista automotivo e redator comercial brasileiro. Seu papel é corrigir, completar e padronizar os dados de um veículo seminovo para uma plataforma de vendas como a Kavak ou CarMax.

Sua missão é gerar informações confiáveis e ao mesmo tempo extremamente persuasivas para o cliente final, aumentando o interesse e ajudando na indexação SEO (sem exageros ou termos genéricos).

🔧 DADOS DO VEÍCULO (para corrigir):
Marca: ${vehicle.marca}
Modelo: ${vehicle.modelo}
Versão: ${vehicle.versao || 'Não informada'}
Ano: ${vehicle.ano || 'Não informado'}
Preço: ${vehicle.preco ? parseFloat(vehicle.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não informado'}
Combustível: ${vehicle.combustivel || 'Não informado'}
Transmissão: ${vehicle.cambio || 'Não informada'}
Quilometragem: ${vehicle.km || 'Não informada'} km
Placa: ${vehicle.placa || 'Não informada'}
Categoria: ${vehicle.categoria || vehicle.tipo_veiculo || 'Não informada'}
Descrição: ${vehicle.informacoes || 'Não informada'}
Opcionais: ${JSON.stringify(vehicle.equipamentos) || 'Não informados'}

🎯 TAREFAS

✅ Corrigir Marca, Modelo e Versão
- Padronizar nomes corretos e oficiais
- Garantir que marca e modelo combinem corretamente
- Versão com formatação correta, sem duplicidade

✅ Padronizar Combustível e Transmissão
- Combustível: Flex, Gasolina, Diesel, Elétrico, Híbrido
- Câmbio: Manual, Automático, CVT

✅ Identificar Categoria de Veículo CORRETA (OBRIGATÓRIO)
- Volkswagen Tiguan = SUV (não sedan ou hatch)
- Ford Ka = Hatch
- Honda City = Sedan  
- Chevrolet Onix = Hatch
- Jeep Renegade = SUV
- Fiat Toro = Pick-up
- SEMPRE identificar a categoria correta baseada no modelo real

✅ Corrigir e melhorar Descrição (MÍNIMO 6 LINHAS / 200 palavras)
- A descrição deve ser comercial, fluida, persuasiva e engajadora
- PELO MENOS 6 LINHAS de texto corrido
- Foque no perfil do comprador e benefícios práticos do ${vehicle.marca} ${vehicle.modelo}
- Destaque economia de combustível, praticidade urbana, segurança e confiabilidade
- Use linguagem clara e atraente, com foco em experiência de uso real
- Mencione principais características técnicas e diferenciais do modelo

✅ Organizar e Corrigir Opcionais (OBRIGATÓRIO: 5 ITENS POR CATEGORIA)
- Separar em: INTERIOR, EXTERIOR, SEGURANÇA, CONFORTO
- CADA categoria deve ter EXATAMENTE 5 itens válidos (não menos, não mais)
- Se não souber 5 itens específicos do modelo, use equipamentos comuns mas plausíveis
- ESTRUTURA OBRIGATÓRIA:
  * INTERIOR: ["item1", "item2", "item3", "item4", "item5"]
  * EXTERIOR: ["item1", "item2", "item3", "item4", "item5"] 
  * SEGURANÇA: ["item1", "item2", "item3", "item4", "item5"]
  * CONFORTO: ["item1", "item2", "item3", "item4", "item5"]

EXEMPLOS OBRIGATÓRIOS para completar 5 itens:
- INTERIOR: Ar-condicionado, Direção elétrica, Vidros elétricos, Central multimídia, Computador de bordo
- EXTERIOR: Rodas de liga leve, Faróis de neblina, Retrovisores elétricos, Para-choques na cor, Maçanetas na cor
- SEGURANÇA: Airbags frontais, ABS + EBD, Controle de estabilidade, Alarme, Travas elétricas  
- CONFORTO: Banco regulável, Apoio de braço, Porta-objetos, Entrada USB, Bluetooth

❌ REJEITADO: Qualquer categoria com menos de 5 itens será considerada ERRO GRAVE

✅ Preencher Especificações Técnicas (OBRIGATÓRIO - NUNCA VAZIO)
- TODOS os campos devem ter valores numéricos reais do ${vehicle.marca} ${vehicle.modelo} ${vehicle.ano || ''}
- comprimento: tamanho em mm (ex: "4200")
- largura: largura em mm (ex: "1700") 
- altura: altura em mm (ex: "1500")
- porta_malas: capacidade litros (ex: "300")
- capacidade: pessoas (ex: "5")
- peso: peso kg (ex: "1200")
- potencia_maxima: potência em cv (ex: "139")
- torque_maximo: torque em kgfm com vírgula decimal (ex: "19,3")
- consumo_urbano: consumo cidade km/l com vírgula decimal (ex: "9,1")
- consumo_rodoviario: consumo estrada km/l com vírgula decimal (ex: "11,7")
- autonomia_urbana: autonomia cidade km (ex: "430")
- autonomia_rodoviaria: autonomia estrada km (ex: "550")
- RETORNAR APENAS NÚMEROS SEM UNIDADES
- USE VÍRGULA COMO SEPARADOR DECIMAL para torque, consumo urbano e rodoviário
- ❌ NUNCA retornar campos vazios "" - SEMPRE preencher com dados reais

⚠️ REGRAS ABSOLUTAS - FALHA = REJEIÇÃO TOTAL
❌ Não gerar ou mencionar tags
❌ Não inventar opcionais que não combinam com o modelo/ano
❌ Não duplicar a categoria de veículo nas especificações
❌ Não preencher campos com dados fantasiosos
❌ Não gerar textos técnicos demais
❌ ERRO GRAVE: Menos de 5 itens em qualquer categoria de opcionais
❌ ERRO GRAVE: Errar categoria de veículo (Tiguan=SUV, Ka=Hatch, City=Sedan)
❌ ERRO GRAVE: Deixar qualquer array de opcionais com menos de 5 strings
❌ ERRO GRAVE: Não seguir a estrutura ["item1", "item2", "item3", "item4", "item5"]

🚨 VALIDAÇÃO AUTOMÁTICA: A resposta será rejeitada se qualquer categoria tiver ≠ 5 itens

✅ EXEMPLO DE RESPOSTA CORRETA (Volkswagen Tiguan 2019):
{
  "marca_corrigida": "Volkswagen",
  "modelo_corrigido": "Tiguan",
  "versao_corrigida": "Allspace Comfortline 1.4 TSI",
  "categoria_corrigida": "SUV",
  "combustivel_corrigido": "Flex",
  "cambio_corrigido": "Automático",
  "descricao_corrigida": "O Volkswagen Tiguan Allspace oferece o melhor dos dois mundos: o conforto e a dirigibilidade de um carro de passeio com a robustez e versatilidade de um SUV. Com seu motor 1.4 TSI turbo e câmbio automático de 6 marchas, proporciona performance eficiente e suave em qualquer situação. O amplo espaço interno acomoda confortavelmente até 7 pessoas, enquanto o porta-malas generoso atende todas as necessidades familiares. Equipado com tecnologias avançadas de segurança e conectividade, o Tiguan garante tranquilidade e praticidade no dia a dia urbano e nas aventuras de fim de semana.",
  "opcionais_corrigidos": {
    "INTERIOR": ["Ar-condicionado automático digital", "Central multimídia com tela touch", "Volante multifuncional em couro", "Bancos em couro", "Computador de bordo"],
    "EXTERIOR": ["Rodas de liga leve 17\"", "Faróis de LED", "Retrovisores elétricos", "Teto solar panorâmico", "Proteções laterais"],
    "SEGURANÇA": ["6 Airbags", "ABS + EBD + ESP", "Controle de estabilidade", "Alarme antifurto", "Travamento automático"],
    "CONFORTO": ["Piloto automático", "Sensor de estacionamento", "Câmera de ré", "Entrada USB", "Bluetooth"]
  },
  "especificacoes_tecnicas": {
    "comprimento": "4486",
    "largura": "1839",
    "altura": "1632",
    "porta_malas": "230",
    "capacidade": "7",
    "peso": "1685",
    "potencia_maxima": "139",
    "torque_maximo": "19,3",
    "consumo_urbano": "9,1",
    "consumo_rodoviario": "11,7",
    "autonomia_urbana": "430",
    "autonomia_rodoviaria": "550"
  },
  "sugestoes_correcao": []
}

🔥 ESTRUTURA JSON OBRIGATÓRIA - COPIE EXATAMENTE:
{
  "marca_corrigida": "string",
  "modelo_corrigido": "string", 
  "versao_corrigida": "string",
  "categoria_corrigida": "string",
  "combustivel_corrigido": "string",
  "cambio_corrigido": "string",
  "descricao_corrigida": "string com 6+ linhas",
  "opcionais_corrigidos": {
    "INTERIOR": ["item1", "item2", "item3", "item4", "item5"],
    "EXTERIOR": ["item1", "item2", "item3", "item4", "item5"],
    "SEGURANÇA": ["item1", "item2", "item3", "item4", "item5"],
    "CONFORTO": ["item1", "item2", "item3", "item4", "item5"]
  },
  "especificacoes_tecnicas": {
    "comprimento": "numero",
    "largura": "numero",
    "altura": "numero", 
    "porta_malas": "numero",
    "capacidade": "numero",
    "peso": "numero",
    "potencia_maxima": "numero",
    "torque_maximo": "numero_com_virgula",
    "consumo_urbano": "numero_com_virgula",
    "consumo_rodoviario": "numero_com_virgula",
    "autonomia_urbana": "numero",
    "autonomia_rodoviaria": "numero"
  },
  "preenchidoIA": true,
  "sugestoes_correcao": []
}`,
            max_tokens: 3000,
            temperature: 0.7
          })
        });

        console.log('📨 Resposta da API recebida:', response.status);

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        console.log('📄 Dados recebidos:', data ? 'OK' : 'VAZIO');
        
        if (!data.content && !data.reply) {
          throw new Error('Resposta vazia da IA');
        }

        // O servidor retorna 'content' ao invés de 'reply'
        const aiData = JSON.parse(data.content || data.reply);
        console.log('✅ Dados processados pela IA');

        // Salvar no banco com flag preenchidoIA = true
        console.log('💾 Salvando veículo processado:', {
          id_documento: vehicle.id,
          vehicle_uuid: vehicle.vehicle_uuid,
          marca: vehicle.marca,
          modelo: vehicle.modelo
        });
        
        try {
          // IMPORTANTE: usar vehicle.id (ID do documento) e não vehicle_uuid
          if (!vehicle.id) {
            console.error('❌ Veículo sem ID do documento:', vehicle);
            console.error('Estrutura completa do veículo:', JSON.stringify(vehicle, null, 2));
            throw new Error('ID do documento não encontrado');
          }
          
          const vehicleRef = doc(db, 'veiculos', vehicle.id);  // Usar ID do documento
          
          // Verificar se o documento existe
          const docSnap = await getDoc(vehicleRef);
          if (!docSnap.exists()) {
            console.error('❌ Documento não existe no Firestore:', vehicle.id);
            throw new Error('Documento não encontrado');
          }
          
          console.log('📄 Documento encontrado, tentando salvar flag...');
          
          // Teste simplificado - salvar apenas um campo por vez
          try {
            // Primeiro teste: salvar apenas preenchidoIA
            await updateDoc(vehicleRef, {
              preenchidoIA: true
            });
            console.log('✅ preenchidoIA salvo!');
            
            // Segundo teste: salvar data
            await updateDoc(vehicleRef, {
              data_atualizacao_ia: new Date().toISOString()
            });
            console.log('✅ data_atualizacao_ia salva!');
            
          } catch (flagError) {
            console.error('❌ Erro ao salvar flag:', flagError);
            console.error('❌ Código do erro:', flagError.code);
            console.error('❌ Mensagem:', flagError.message);
            throw flagError;
          }
          
          // Agora salvar os dados processados pela IA
          const updateData = {
            marca: aiData.marca_corrigida || vehicle.marca,
            modelo: aiData.modelo_corrigido || vehicle.modelo,
            versao: aiData.versao_corrigida || vehicle.versao,
            categoria: aiData.categoria_corrigida || vehicle.categoria,
            combustivel: aiData.combustivel_corrigido || vehicle.combustivel,
            cambio: aiData.cambio_corrigido || vehicle.cambio,
            informacoes: aiData.descricao_corrigida || vehicle.informacoes,
            equipamentos: aiData.opcionais_corrigidos || vehicle.equipamentos,
            especificacoes_tecnicas: {
              ...vehicle.especificacoes_tecnicas,
              ...aiData.especificacoes_tecnicas,
              tipo_veiculo: aiData.categoria_corrigida || vehicle.categoria
            }
          };
          
          console.log('📝 Salvando dados processados...', updateData);
          
          try {
            await updateDoc(vehicleRef, updateData);
            console.log('✅ Veículo salvo com sucesso!');
          } catch (updateError) {
            console.error('❌ Erro ao salvar dados processados:', updateError);
            console.error('❌ Detalhes do erro:', {
              code: updateError.code,
              message: updateError.message,
              stack: updateError.stack
            });
            throw updateError;
          }
          
        } catch (saveError) {
          console.error('❌ Erro ao salvar veículo:', saveError);
          throw saveError;
        }
        
        // Atualizar o estado local imediatamente para mostrar ✅ na interface
        setFirestoreVehicles(prev => 
          prev.map(v => 
            v.vehicle_uuid === vehicle.vehicle_uuid 
              ? { ...v, preenchidoIA: true, data_atualizacao_ia: new Date() }
              : v
          )
        );
        
        processados++;

        // Aguardar 1 segundo entre processamentos
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Erro ao processar ${vehicle.placa}:`, error);
        console.error('Stack:', error.stack);
        erros++;
      }
    }

    console.log('📊 Processamento finalizado:', {
      processados,
      erros,
      total: veiculosPendentes.length
    });

    // Atualizar lista de veículos
    await loadFirestoreVehicles();

    setProcessandoLoteIA(false);
    setProgressoIA({
      atual: 0,
      total: 0,
      veiculoAtual: ''
    });

    showToast(
      `Processamento concluído!\n✅ ${processados} veículos processados\n${erros > 0 ? `❌ ${erros} erros` : ''}`,
      processados > 0 ? 'success' : 'error'
    );
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

  // === FUNÇÕES PARA VÍDEO DA SEMANA ===

  // Carregar vídeo atual
  const loadVideoSemana = async () => {
    try {
      const videoDoc = await getDoc(doc(db, 'config', 'video_semana'));
      if (videoDoc.exists()) {
        const data = videoDoc.data();
        setVideoForm({
          video_url: data.video_url || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar vídeo da semana:', error);
      setVideoError('Erro ao carregar vídeo atual');
    }
  };

  // Validar URL do vídeo
  const validateVideoUrl = (url) => {
    if (!url || !url.trim()) return false;
    
    try {
      // Validar YouTube (incluindo Shorts)
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      
      // Validar Vimeo
      const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
      
      const isValid = youtubeRegex.test(url) || vimeoRegex.test(url);
      console.log('🎬 Validando URL:', url, 'Válida:', isValid);
      
      return isValid;
    } catch (error) {
      console.error('Erro na validação de URL:', error);
      return false;
    }
  };

  // Formatar URL para embed
  const formatEmbedUrl = (url) => {
    if (!url || !url.trim()) return '';
    
    try {
      // YouTube (incluindo Shorts)
      const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (youtubeMatch && youtubeMatch[1]) {
        const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`;
        console.log('🎬 URL formatada para YouTube:', embedUrl);
        return embedUrl;
      }
      
      // Vimeo
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        const embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        console.log('🎬 URL formatada para Vimeo:', embedUrl);
        return embedUrl;
      }
      
      console.log('🎬 URL não reconhecida, retornando original:', url);
      return url;
    } catch (error) {
      console.error('Erro ao formatar URL:', error);
      return '';
    }
  };

  // Salvar vídeo da semana
  const handleSaveVideo = async () => {
    setVideoLoading(true);
    setVideoError('');
    
    try {
      if (videoForm.video_url && !validateVideoUrl(videoForm.video_url)) {
        setVideoError('URL inválida. Use apenas links do YouTube ou Vimeo.');
        return;
      }

      await setDoc(doc(db, 'config', 'video_semana'), {
        video_url: videoForm.video_url.trim(),
        updated_at: new Date().toISOString()
      });

      showToast('Vídeo da semana atualizado com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro ao salvar vídeo:', error);
      setVideoError('Erro ao salvar vídeo. Tente novamente.');
      showToast('Erro ao salvar vídeo da semana', 'error');
    } finally {
      setVideoLoading(false);
    }
  };

  // === FIM DAS FUNÇÕES DE VÍDEO ===

  // useEffect para carregar dados
  useEffect(() => {
    if (isAuthenticated) {
      loadFirestoreVehicles();
      loadCustomTags(); // Carregar tags personalizadas
      loadVideoSemana(); // Carregar vídeo da semana
      if (activeTab === 'bestsellers') {
        loadBestSellersVehicles();
      }
      if (activeTab === 'blog') {
        loadBlogPosts(); // Carregar posts do blog
      }
      if (activeTab === 'testimonials') {
        loadTestimonials(); // Carregar depoimentos
      }
    }
  }, [isAuthenticated, activeTab]);

  // Verificação de autenticação
  if (!isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>Login Admin - Átria Veículos</title>
        </Helmet>
        
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
            <div className="text-center mb-8">
              <img height="60" width="150" fetchpriority="low" decoding="async" loading="lazy" src="/images/logos/logo.png" alt="Átria Veículos" className="h-16 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Administrativo</h1>
              <p className="text-gray-600">Entre com suas credenciais para acessar o painel</p>
            </div>

            <form onSubmit={handleLogin}>
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
      </>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <Helmet>
        <title>Painel Admin - Átria Veículos</title>
      </Helmet>
      
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
        {/* Header Admin */}
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

          {/* Header de Navegação Moderno */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
            padding: '16px 24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              {/* Logo da Átria */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '24px',
                fontWeight: '700',
                color: '#1A75FF',
                fontFamily: 'DM Sans, sans-serif'
              }}>
                🚗 Átria Admin
              </div>

              {/* Navigation Menu */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {[
                  { id: 'dashboard', label: 'Importar', icon: '📋' },
                  { id: 'estoque', label: 'Estoque', icon: '🏪' },
                  { id: 'bestsellers', label: 'Mais Vendidos', icon: '⭐' },
                  { id: 'leads', label: 'Leads', icon: '👥' },
                  { id: 'tags', label: 'Tags', icon: '🏷️' },
                  { id: 'video', label: 'Vídeo', icon: '📹' },
                  { id: 'testimonials', label: 'Depoimentos', icon: '💬' },
                  { id: 'blog', label: 'Blog', icon: '📝' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      border: activeTab === tab.id ? '2px solid #1A75FF' : '2px solid transparent',
                      backgroundColor: activeTab === tab.id ? '#1A75FF' : '#f8fafc',
                      color: activeTab === tab.id ? 'white' : '#64748b',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'DM Sans, sans-serif',
                      borderRadius: '8px'
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            minHeight: '600px'
          }}>

            {/* Conteúdo das Abas */}
            <div style={{ padding: activeTab === 'leads' ? '0' : '32px' }}>
              {activeTab === 'dashboard' && (
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1a2332',
                    marginBottom: '20px',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                    Importar & Limpar Estoque
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
                        backgroundColor: 'white',
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
                        backgroundColor: 'white',
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

                  {/* Upload de Planilha */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    border: '2px solid #e2e8f0',
                    marginBottom: '30px'
                  }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#1a2332',
                      marginBottom: '20px',
                      fontFamily: 'DM Sans, sans-serif'
                    }}>
                      📋 Importar Nova Planilha
                    </h3>

                    <div style={{
                      backgroundColor: '#fef3c7',
                      border: '1px solid #f59e0b',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '24px'
                    }}>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#92400e',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        ⚠️ Atenção: Substituição Completa
                      </div>
                      <div style={{ fontSize: '13px', color: '#92400e' }}>
                        Ao importar uma nova planilha, TODOS os veículos existentes serão removidos e substituídos pelos novos dados.
                      </div>
                    </div>

                    {/* Campo de Upload */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Selecionar Arquivo Excel (.xlsx)
                      </label>
                      
                      <div style={{
                        border: '2px dashed #d1d5db',
                        borderRadius: '8px',
                        padding: '24px',
                        textAlign: 'center',
                        backgroundColor: '#fafafa',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                          style={{ display: 'none' }}
                        />
                        
                        {!selectedFile ? (
                          <div onClick={() => fileInputRef.current?.click()}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
                            <div style={{ 
                              fontSize: '16px', 
                              fontWeight: '600', 
                              color: '#374151',
                              marginBottom: '8px'
                            }}>
                              Clique para selecionar arquivo
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              Formatos aceitos: .xlsx, .xls
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                            <div style={{ 
                              fontSize: '16px', 
                              fontWeight: '600', 
                              color: '#059669',
                              marginBottom: '8px'
                            }}>
                              Arquivo Selecionado
                            </div>
                            <div style={{ fontSize: '14px', color: '#374151', marginBottom: '12px' }}>
                              {selectedFile.name}
                            </div>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              style={{
                                backgroundColor: '#6b7280',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Trocar Arquivo
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      justifyContent: 'center'
                    }}>
                      <button
                        onClick={handleUpdateStock}
                        disabled={!selectedFile || loading}
                        style={{
                          backgroundColor: selectedFile && !loading ? '#10b981' : '#d1d5db',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: selectedFile && !loading ? 'pointer' : 'not-allowed',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {loading ? 'Atualizando...' : '🔄 Atualizar Estoque'}
                      </button>

                      <button
                        onClick={handleClearDatabase}
                        disabled={loading}
                        style={{
                          backgroundColor: loading ? '#d1d5db' : '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {loading ? 'Aguarde...' : '🗑️ Limpar Banco'}
                      </button>
                    </div>

                    {/* Status de Importação */}
                    {importStatus && (
                      <div style={{
                        marginTop: '24px',
                        padding: '16px',
                        backgroundColor: importStatus.includes('❌') ? '#fef2f2' : '#f0f9ff',
                        border: `1px solid ${importStatus.includes('❌') ? '#fecaca' : '#bae6fd'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: importStatus.includes('❌') ? '#dc2626' : '#0369a1'
                      }}>
                        {importStatus}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Aba Mais Vendidos */}
              {activeTab === 'bestsellers' && (
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1a2332',
                    marginBottom: '20px',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                    Mais Vendidos - Carrossel Homepage
                  </h2>
                  
                  <div style={{ 
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <p style={{ color: '#64748b', marginBottom: '20px' }}>
                      Use os botões de seta para reordenar os veículos no carrossel da homepage
                    </p>
                    
                    {/* Lista de veículos "Mais Vendidos" para ordenação */}
                    <div style={{
                      display: 'grid',
                      gap: '12px'
                    }}>
                      {bestSellersVehicles.map((vehicle, index) => (
                        <div
                          key={vehicle.vehicle_uuid}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '2px solid #e2e8f0'
                          }}
                        >
                          <div style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: '#1A75FF',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {index + 1}
                          </div>
                          
                          <img fetchpriority="low" decoding="async" loading="lazy" src={vehicle.photos?.[0] || vehicle.imagens?.[0]} alt={`${vehicle.marca} ${vehicle.modelo}`} style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontWeight: '600', 
                              color: '#1a2332',
                              marginBottom: '4px'
                            }}>
                              {vehicle.marca} {vehicle.modelo}
                            </div>
                            <div style={{ 
                              fontSize: '14px', 
                              color: '#64748b',
                              marginBottom: '4px'
                            }}>
                              {vehicle.versao} - {(vehicle.preco ? parseFloat(vehicle.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00')}
                            </div>
                            <div style={{ 
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <span style={{ color: '#64748b' }}>Placa:</span>
                              <button
                                onClick={() => openEditModal(vehicle)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#1A75FF',
                                  textDecoration: 'none',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  padding: '0',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                                title="Clique para editar o veículo e configurar tags"
                              >
                                {vehicle.placa}
                              </button>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => moveVehicleInCarousel(index, index - 1)}
                              disabled={index === 0}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: index === 0 ? '#f3f4f6' : '#1A75FF',
                                color: index === 0 ? '#9ca3af' : 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: index === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              ↑ Subir
                            </button>
                            <button
                              onClick={() => moveVehicleInCarousel(index, index + 1)}
                              disabled={index === bestSellersVehicles.length - 1}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: index === bestSellersVehicles.length - 1 ? '#f3f4f6' : '#1A75FF',
                                color: index === bestSellersVehicles.length - 1 ? '#9ca3af' : 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: index === bestSellersVehicles.length - 1 ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              ↓ Descer
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {bestSellersVehicles.length === 0 && (
                        <div style={{
                          textAlign: 'center',
                          padding: '40px',
                          color: '#64748b',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          border: '2px dashed #e2e8f0'
                        }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
                          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                            Nenhum veículo "Mais Vendido" encontrado
                          </div>
                          <div style={{ fontSize: '14px' }}>
                            Vá para a aba "Gerenciar Estoque" e marque veículos como "Mais Vendidos" 
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Gerenciar Estoque */}
              {activeTab === 'estoque' && (
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1a2332',
                    marginBottom: '20px',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                    Gerenciar Estoque de Veículos
                  </h2>

                  {/* Filtros de Busca */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px'
                    }}>
                      <div>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '4px'
                        }}>
                          Buscar por texto
                        </label>
                        <input
                          type="text"
                          placeholder="Marca, modelo, placa..."
                          value={filters.search}
                          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '4px'
                        }}>
                          Marca
                        </label>
                        <select
                          value={filters.brand}
                          onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="">Todas as marcas</option>
                          {Array.from(new Set(firestoreVehicles.map(v => v.marca).filter(Boolean))).map(marca => (
                            <option key={marca} value={marca}>{marca}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '4px'
                        }}>
                          Status
                        </label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="">Todos</option>
                          <option value="ativo">Ativos</option>
                          <option value="inativo">Inativos</option>
                          <option value="mais_vendidos">Mais Vendidos</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Instruções e Botão de Processamento IA */}
                  <div style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#1e40af', marginBottom: '8px', fontWeight: '600' }}>
                        💡 Instruções de Uso:
                      </div>
                      <div style={{ fontSize: '13px', color: '#1e40af' }}>
                        • Clique na <strong>placa</strong> para editar veículo completo • Use o botão <strong>Ativo</strong> para alterações rápidas • Filtros funcionam em tempo real
                      </div>
                    </div>
                    
                    {/* Botão de Processamento em Lote */}
                    <button
                      onClick={handleProcessamentoLoteIA}
                      disabled={processandoLoteIA || firestoreVehicles.filter(v => !v.preenchidoIA).length === 0}
                      style={{
                        backgroundColor: processandoLoteIA ? '#6b7280' : '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: processandoLoteIA || firestoreVehicles.filter(v => !v.preenchidoIA).length === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        minWidth: '280px',
                        justifyContent: 'center'
                      }}
                    >
                      {processandoLoteIA ? (
                        <>
                          <span style={{
                            display: 'inline-block',
                            width: '16px',
                            height: '16px',
                            border: '2px solid #ffffff',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></span>
                          Processando {progressoIA.atual} de {progressoIA.total}...
                        </>
                      ) : (
                        <>
                          🤖 Preencher veículos pendentes com IA
                          {firestoreVehicles.filter(v => !v.preenchidoIA).length > 0 && (
                            <span style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              borderRadius: '12px',
                              padding: '2px 8px',
                              fontSize: '12px',
                              fontWeight: '700'
                            }}>
                              {firestoreVehicles.filter(v => !v.preenchidoIA).length}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Progresso do Processamento IA */}
                  {processandoLoteIA && progressoIA.veiculoAtual && (
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '24px'
                    }}>
                      <div style={{ fontSize: '14px', color: '#166534', marginBottom: '8px' }}>
                        <strong>Processando:</strong> {progressoIA.veiculoAtual}
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#dcfce7',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(progressoIA.atual / progressoIA.total) * 100}%`,
                          height: '100%',
                          backgroundColor: '#10b981',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                  )}

                  {/* Tabela de Veículos */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      maxHeight: '600px',
                      overflowY: 'auto'
                    }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                      }}>
                        <thead style={{
                          backgroundColor: '#f8fafc',
                          position: 'sticky',
                          top: 0,
                          zIndex: 10
                        }}>
                          <tr>
                            <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                              Foto
                            </th>
                            <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                              Placa
                            </th>
                            <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                              Veículo
                            </th>
                            <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                              Ano
                            </th>
                            <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                              Preço
                            </th>
                            <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                              Data de Cadastro
                            </th>
                            <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                              Tag
                            </th>
                            <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                              IA
                            </th>
                            <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                              Ativo?
                            </th>
                            <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                              Excluir
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredVehicles().map((vehicle, index) => (
                            <tr 
                              key={vehicle.vehicle_uuid}
                              style={{
                                backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                                borderBottom: '1px solid #f3f4f6'
                              }}
                            >
                              <td style={{ padding: '8px' }}>
                                <img fetchpriority="low" decoding="async" loading="lazy" src={(() => {
                                    // Processar fotos se for string separada por ponto e vírgula
                                    if (vehicle.fotos && typeof vehicle.fotos === 'string') {
                                      const fotosArray = vehicle.fotos.split(';').filter(url => url.trim());
                                      return fotosArray[0] || '/placeholder-car.jpg';
                                    }
                                    // Fallback para sistema existente
                                    return vehicle.photos?.[0] || vehicle.imagens?.[0] || vehicle.fotos?.[0] || '/placeholder-car.jpg';
                                  })()}
                                  alt={`${vehicle.marca} ${vehicle.modelo}`}
                                  style={{
                                    width: '50px',
                                    height: '35px',
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                  }}
                                />
                              </td>
                              <td style={{ padding: '8px' }}>
                                <button
                                  onClick={() => openEditModal(vehicle)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#1A75FF',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600'
                                  }}
                                >
                                  {vehicle.placa}
                                </button>
                              </td>
                              <td style={{ padding: '8px' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a2332' }}>
                                  {vehicle.marca} {vehicle.modelo}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  {vehicle.versao}
                                </div>
                              </td>
                              <td style={{ padding: '8px', textAlign: 'center', fontSize: '13px' }}>
                                {vehicle.ano}
                              </td>
                              <td style={{ padding: '8px', textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>
                                {(vehicle.preco ? parseFloat(vehicle.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00')}
                              </td>
                              <td style={{ padding: '8px', textAlign: 'center', fontSize: '11px' }}>
                                {(() => {
                                  // Procurar por qualquer campo de data válido
                                  const date = vehicle.data_cadastro || 
                                              vehicle.data_atualizacao || 
                                              vehicle.created_at || 
                                              vehicle.updated_at || 
                                              vehicle.timestamp;
                                  
                                  if (date) {
                                    try {
                                      // Tentar diferentes formatos de data
                                      let dateObj;
                                      if (typeof date === 'string') {
                                        dateObj = new Date(date);
                                      } else if (date && date.toDate) {
                                        // Firestore Timestamp
                                        dateObj = date.toDate();
                                      } else if (date && date.seconds) {
                                        // Firestore Timestamp as plain object
                                        dateObj = new Date(date.seconds * 1000);
                                      } else {
                                        dateObj = new Date(date);
                                      }
                                      
                                      if (dateObj && !isNaN(dateObj.getTime())) {
                                        return dateObj.toLocaleDateString('pt-BR', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: '2-digit'
                                        });
                                      }
                                    } catch (error) {
                                      console.warn('Erro ao formatar data:', error);
                                    }
                                  }
                                  return 'N/A';
                                })()}
                              </td>
                              <td style={{ padding: '8px', textAlign: 'center', fontSize: '11px' }}>
                                {(vehicle.tag || vehicle.custom_tag) ? (
                                  <span style={{
                                    backgroundColor: (vehicle.tag?.cor || '#1A75FF'),
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px'
                                  }}>
                                    {String(vehicle.tag?.nome || vehicle.tag || vehicle.custom_tag)}
                                  </span>
                                ) : (
                                  <span style={{ color: '#9ca3af' }}>-</span>
                                )}
                              </td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>
                                <span style={{
                                  fontSize: '20px',
                                  lineHeight: '1'
                                }}>
                                  {vehicle.preenchidoIA ? '✅' : '❌'}
                                </span>
                              </td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>
                                <button
                                  onClick={() => toggleVehicleStatus(vehicle.id, 'ativo', !vehicle.ativo)}
                                  style={{
                                    backgroundColor: vehicle.ativo ? '#10b981' : '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    minWidth: '60px'
                                  }}
                                >
                                  {vehicle.ativo ? 'SIM' : 'NÃO'}
                                </button>
                              </td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>
                                <button
                                  onClick={() => handleDeleteVehicle(vehicle.id)}
                                  style={{
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    minWidth: '50px'
                                  }}
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {getFilteredVehicles().length === 0 && (
                        <div style={{
                          textAlign: 'center',
                          padding: '40px',
                          color: '#64748b'
                        }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                            Nenhum veículo encontrado
                          </div>
                          <div style={{ fontSize: '14px' }}>
                            Ajuste os filtros ou importe uma nova planilha
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações da Tabela */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '16px',
                    fontSize: '14px',
                    color: '#64748b'
                  }}>
                    <div>
                      Mostrando {getFilteredVehicles().length} de {firestoreVehicles.length} veículos
                    </div>
                    <div>
                      {firestoreVehicles.filter(v => v.ativo).length} ativos • {firestoreVehicles.filter(v => v.mais_vendidos).length} em destaque
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Leads Recebidos */}
              {activeTab === 'leads' && (
                <div style={{ margin: '-32px' }}>
                  <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Carregando leads...</div>}>
                    <AdminLeadsEmailStyle />
                  </Suspense>
                </div>
              )}

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

              {/* Aba Vídeo da Semana */}
              {activeTab === 'video' && (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px'
                  }}>
                    <div>
                      <h2 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#1a2332',
                        marginBottom: '8px',
                        fontFamily: 'DM Sans, sans-serif'
                      }}>
                        Vídeo da Semana
                      </h2>
                      <p style={{
                        color: '#64748b',
                        fontSize: '16px',
                        margin: 0
                      }}>
                        Configure o vídeo promocional que será exibido na homepage
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '32px',
                    alignItems: 'start'
                  }}>
                    {/* Formulário de Vídeo */}
                    <div style={{
                      backgroundColor: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1a2332',
                        marginBottom: '20px'
                      }}>
                        Configuração do Vídeo
                      </h3>

                      <div style={{ marginBottom: '20px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          URL do Vídeo (YouTube ou Vimeo)
                        </label>
                        <input
                          type="url"
                          value={videoForm.video_url}
                          onChange={(e) => setVideoForm(prev => ({ ...prev, video_url: e.target.value }))}
                          placeholder="https://www.youtube.com/watch?v=..."
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginTop: '4px',
                          fontStyle: 'italic'
                        }}>
                          Cole aqui o link completo do YouTube ou Vimeo
                        </p>
                      </div>



                      {videoError && (
                        <div style={{
                          backgroundColor: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          padding: '12px',
                          borderRadius: '8px',
                          marginBottom: '16px',
                          fontSize: '14px'
                        }}>
                          {videoError}
                        </div>
                      )}

                      <button
                        onClick={handleSaveVideo}
                        disabled={videoLoading}
                        style={{
                          backgroundColor: videoLoading ? '#9ca3af' : '#1A75FF',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: videoLoading ? 'not-allowed' : 'pointer',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        {videoLoading && (
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid currentColor',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                        )}
                        {videoLoading ? 'Salvando...' : 'Salvar Vídeo'}
                      </button>
                    </div>

                    {/* Preview do Vídeo */}
                    <div style={{
                      backgroundColor: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1a2332',
                        marginBottom: '20px'
                      }}>
                        Preview do Vídeo
                      </h3>

                      {videoForm.video_url && validateVideoUrl(videoForm.video_url) ? (
                        <div style={{
                          position: 'relative',
                          paddingBottom: '56.25%',
                          height: 0,
                          overflow: 'hidden',
                          borderRadius: '8px',
                          backgroundColor: '#f3f4f6'
                        }}>
                          <iframe
                            src={formatEmbedUrl(videoForm.video_url)}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              border: 'none',
                              borderRadius: '8px'
                            }}
                            allowFullScreen
                            title="Video Preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div style={{
                          aspectRatio: '16 / 9',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          color: '#6b7280',
                          textAlign: 'center',
                          padding: '24px'
                        }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
                          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                            Nenhum vídeo configurado
                          </div>
                          <div style={{ fontSize: '14px' }}>
                            Insira uma URL válida do YouTube ou Vimeo para ver o preview
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instruções de Uso */}
                  <div style={{
                    marginTop: '32px',
                    padding: '20px',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#0c4a6e',
                      marginBottom: '12px'
                    }}>
                      💡 Como usar o Vídeo da Semana
                    </h4>
                    <ul style={{
                      fontSize: '14px',
                      color: '#075985',
                      margin: 0,
                      paddingLeft: '20px'
                    }}>
                      <li style={{ marginBottom: '8px' }}>
                        Cole o link completo do YouTube (ex: https://www.youtube.com/watch?v=abc123) ou Vimeo
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        O vídeo será automaticamente convertido para formato embed
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        A legenda é opcional e aparecerá junto com o vídeo na homepage
                      </li>
                      <li>
                        Use vídeos promocionais, tours virtuais ou apresentações de ofertas especiais
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Aba Blog */}
              {activeTab === 'blog' && (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px'
                  }}>
                    <div>
                      <h2 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#1a2332',
                        marginBottom: '8px',
                        fontFamily: 'DM Sans, sans-serif'
                      }}>
                        Gerenciar Blog
                      </h2>
                      <p style={{
                        color: '#64748b',
                        fontSize: '16px',
                        margin: 0
                      }}>
                        Crie, edite e gerencie os posts do blog da Átria Veículos
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={importLegacyBlogPosts}
                        disabled={blogLoading}
                        style={{
                          backgroundColor: '#059669',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: blogLoading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        📚 Importar Posts Antigos
                      </button>
                      <button
                        onClick={() => openBlogModal()}
                        style={{
                          backgroundColor: '#1A75FF',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        ➕ Novo Post
                      </button>
                    </div>
                  </div>

                  {/* Lista de Posts */}
                  {blogLoading ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px',
                      color: '#64748b'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #e2e8f0',
                        borderTop: '4px solid #1A75FF',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                      }}></div>
                      Carregando posts do blog...
                    </div>
                  ) : blogPosts.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '2px dashed #e2e8f0'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#1a2332',
                        marginBottom: '8px'
                      }}>
                        Nenhum post criado ainda
                      </h3>
                      <p style={{
                        color: '#64748b',
                        fontSize: '16px',
                        marginBottom: '24px'
                      }}>
                        Comece criando seu primeiro post do blog
                      </p>
                      <button
                        onClick={() => openBlogModal()}
                        style={{
                          backgroundColor: '#1A75FF',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Criar Primeiro Post
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr 120px 150px 120px 120px 80px',
                        gap: '16px',
                        padding: '20px',
                        backgroundColor: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        <div>Capa</div>
                        <div>Título</div>
                        <div>Data</div>
                        <div>Categoria</div>
                        <div>Tags</div>
                        <div>Status</div>
                        <div>Ações</div>
                      </div>
                      
                      {blogPosts.map(post => (
                        <div
                          key={post.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '60px 1fr 120px 150px 120px 120px 80px',
                            gap: '16px',
                            padding: '20px',
                            borderBottom: '1px solid #f1f5f9',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            {post.coverImageUrl ? (
                              <img fetchpriority="low" decoding="async" loading="lazy" src={post.coverImageUrl} alt="Capa" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            ) : (
                              <div style={{
                                width: '50px',
                                height: '50px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#9ca3af',
                                fontSize: '20px'
                              }}>
                                📝
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <h4 style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#1a2332',
                              marginBottom: '4px',
                              lineHeight: '1.4'
                            }}>
                              {post.title}
                            </h4>
                            <p style={{
                              fontSize: '12px',
                              color: '#64748b',
                              margin: 0,
                              fontFamily: 'monospace'
                            }}>
                              /blog/{post.slug}
                            </p>
                          </div>
                          
                          <div style={{
                            fontSize: '14px',
                            color: '#64748b'
                          }}>
                            {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                          </div>
                          
                          <div>
                            {post.category ? (
                              <span style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '500',
                                backgroundColor: '#e0f2fe',
                                color: '#0891b2',
                                border: '1px solid #b3e5fc'
                              }}>
                                {post.category}
                              </span>
                            ) : (
                              <span style={{
                                fontSize: '12px',
                                color: '#9ca3af',
                                fontStyle: 'italic'
                              }}>
                                Sem categoria
                              </span>
                            )}
                          </div>
                          
                          <div>
                            {post.tags && post.tags.length > 0 ? (
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '3px'
                              }}>
                                {post.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    style={{
                                      display: 'inline-block',
                                      padding: '2px 6px',
                                      borderRadius: '8px',
                                      fontSize: '10px',
                                      fontWeight: '500',
                                      backgroundColor: '#f0f9ff',
                                      color: '#0369a1',
                                      border: '1px solid #c3ddfd'
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {post.tags.length > 2 && (
                                  <span style={{
                                    fontSize: '10px',
                                    color: '#6b7280',
                                    fontWeight: '500'
                                  }}>
                                    +{post.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{
                                fontSize: '11px',
                                color: '#9ca3af',
                                fontStyle: 'italic'
                              }}>
                                Sem tags
                              </span>
                            )}
                          </div>
                          
                          <div>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: post.isHidden ? '#fef2f2' : '#ecfdf5',
                              color: post.isHidden ? '#dc2626' : '#059669'
                            }}>
                              {post.isHidden ? 'Oculto' : 'Publicado'}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => openBlogModal(post)}
                              style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                padding: '6px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                              title="Editar post"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteBlogPost(post.id, post.title)}
                              style={{
                                backgroundColor: '#dc2626',
                                color: 'white',
                                border: 'none',
                                padding: '6px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                              title="Excluir post"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição de Veículo */}
      {showEditModal && (
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
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Header do Modal */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1a2332',
                margin: 0
              }}>
                Editar Veículo - {editForm.placa}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {/* Coluna 1 - Dados Básicos */}
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a2332',
                    marginBottom: '16px'
                  }}>
                    Dados Básicos
                  </h4>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Marca
                    </label>
                    <input
                      type="text"
                      value={editForm.marca}
                      onChange={(e) => setEditForm(prev => ({ ...prev, marca: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Modelo
                    </label>
                    <input
                      type="text"
                      value={editForm.modelo}
                      onChange={(e) => setEditForm(prev => ({ ...prev, modelo: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Versão
                    </label>
                    <input
                      type="text"
                      value={editForm.versao}
                      onChange={(e) => setEditForm(prev => ({ ...prev, versao: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Categoria do Veículo
                    </label>
                    <select
                      value={editForm.categoria || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, categoria: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Selecionar tipo</option>
                      <option value="Hatch">Hatch</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Pick-up">Pick-up</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Ano
                      </label>
                      <input
                        type="number"
                        value={editForm.ano}
                        onChange={(e) => setEditForm(prev => ({ ...prev, ano: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Quilometragem
                      </label>
                      <input
                        type="number"
                        value={editForm.km}
                        onChange={(e) => setEditForm(prev => ({ ...prev, km: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Combustível
                      </label>
                      <select
                        value={editForm.combustivel}
                        onChange={(e) => setEditForm(prev => ({ ...prev, combustivel: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Selecionar</option>
                        <option value="Flex">Flex</option>
                        <option value="Gasolina">Gasolina</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Elétrico">Elétrico</option>
                        <option value="Híbrido">Híbrido</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Transmissão
                      </label>
                      <select
                        value={editForm.cambio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, cambio: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Selecionar</option>
                        <option value="Manual">Manual</option>
                        <option value="Automático">Automático</option>
                        <option value="CVT">CVT</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Coluna 2 - Preços e Status */}
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a2332',
                    marginBottom: '16px'
                  }}>
                    Preços e Status
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Preço Principal (R$)
                      </label>
                      <input
                        type="number"
                        value={editForm.preco}
                        onChange={(e) => setEditForm(prev => ({ ...prev, preco: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Preço "De" (R$)
                      </label>
                      <input
                        type="number"
                        value={editForm.preco_de}
                        onChange={(e) => setEditForm(prev => ({ ...prev, preco_de: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <h5 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1a2332',
                      marginBottom: '12px'
                    }}>
                      Configurações
                    </h5>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '14px',
                        color: '#374151',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={editForm.ativo}
                          onChange={(e) => setEditForm(prev => ({ ...prev, ativo: e.target.checked }))}
                          style={{ marginRight: '8px' }}
                        />
                        Veículo Ativo no Site
                      </label>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '14px',
                        color: '#374151',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={editForm.mais_vendidos}
                          onChange={(e) => setEditForm(prev => ({ ...prev, mais_vendidos: e.target.checked }))}
                          style={{ marginRight: '8px' }}
                        />
                        Exibir na Homepage (Mais Vendidos)
                      </label>
                    </div>

                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '14px',
                        color: '#374151',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={editForm.mostrar_de_por}
                          onChange={(e) => setEditForm(prev => ({ ...prev, mostrar_de_por: e.target.checked }))}
                          style={{ marginRight: '8px' }}
                        />
                        Mostrar preço "De/Por"
                      </label>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Placa
                    </label>
                    <input
                      type="text"
                      value={editForm.placa}
                      onChange={(e) => setEditForm(prev => ({ ...prev, placa: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Tag Personalizada */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Tag do Veículo
                    </label>
                    
                    {/* Preview da tag selecionada */}
                    {editForm.tag && (
                      <div style={{
                        marginBottom: '8px',
                        padding: '8px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Tag atual:
                        </div>
                        <div style={{
                          backgroundColor: editForm.tag.cor || '#1A75FF',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {editForm.tag.icone && (
                            <LucideIcon name={editForm.tag.icone} size={12} color="white" />
                          )}
                          <span>{editForm.tag.nome || editForm.tag}</span>
                        </div>
                      </div>
                    )}
                    
                    <select
                      value={editForm.tag?.nome || editForm.tag || ''}
                      onChange={(e) => {
                        const selectedTag = customTags.find(tag => tag.nome === e.target.value);
                        setEditForm(prev => ({ ...prev, tag: selectedTag || null }));
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Sem tag</option>
                      {customTags.map(tag => (
                        <option key={tag.id} value={tag.nome}>
                          {tag.nome}
                        </option>
                      ))}
                      {customTags.length === 0 && (
                        <option disabled style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                          Nenhuma tag criada - Vá para "Tags Personalizadas"
                        </option>
                      )}
                    </select>
                    
                    {customTags.length === 0 && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#92400e'
                      }}>
                        💡 Para criar tags personalizadas, acesse a aba "Tags Personalizadas"
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção de Fotos */}
              <div style={{ marginTop: '32px' }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1a2332',
                  marginBottom: '16px'
                }}>
                  Galeria de Fotos
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  {editForm.photos && editForm.photos.length > 0 ? (
                    editForm.photos.map((photo, index) => (
                      <div key={index} style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: index === 0 ? '3px solid #1A75FF' : '2px solid #e2e8f0'
                      }}>
                        <img fetchpriority="low" decoding="async" loading="lazy" src={photo} alt={`Foto ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {index === 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            backgroundColor: '#1A75FF',
                            color: 'white',
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: '600'
                          }}>
                            CAPA
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      padding: '40px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '2px dashed #e2e8f0',
                      color: '#64748b'
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
                      <div>Nenhuma foto disponível</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botão IA Correção Automática */}
              <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <button
                  onClick={generateCompleteInformation}
                  disabled={generatingAi}
                  style={{
                    backgroundColor: generatingAi ? '#d1d5db' : '#16A34A',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: generatingAi ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    margin: '0 auto'
                  }}
                >
                  <LucideIcon name="CheckCircle" size={16} />
                  {generatingAi ? 'Corrigindo dados...' : '🔧 Corrigir com IA'}
                </button>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '8px',
                  fontStyle: 'italic'
                }}>
                  Revisa e corrige automaticamente: marca, modelo, versão, combustível, descrição e opcionais
                </p>
              </div>

              {/* Seção Informações do Veículo */}
              <div style={{ marginTop: '32px' }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1a2332',
                  marginBottom: '16px'
                }}>
                  Informações do Veículo
                </h4>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                    Descrição/Informações
                  </label>
                  <textarea
                    value={editForm.informacoes || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, informacoes: e.target.value }))}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical',
                      ...(aiSuggestions.informacoes ? {
                        backgroundColor: '#EFF6FF',
                        borderColor: '#1E40AF',
                        fontStyle: 'italic',
                        color: '#1E40AF'
                      } : {})
                    }}
                    placeholder="Descrição detalhada do veículo..."
                  />
                  {aiSuggestions.informacoes && (
                    <p style={{
                      fontSize: '11px',
                      color: '#1E40AF',
                      marginTop: '4px',
                      fontStyle: 'italic'
                    }}>
                      ✨ Conteúdo gerado por IA
                    </p>
                  )}
                </div>
              </div>

              {/* Seção Equipamentos/Opcionais */}
              <div style={{ marginTop: '32px' }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1a2332',
                  marginBottom: '16px'
                }}>
                  Equipamentos e Opcionais
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Interior */}
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#1a2332', marginBottom: '8px' }}>
                      Interior
                    </h5>
                    <textarea
                      value={editForm.equipamentos?.INTERIOR ? editForm.equipamentos.INTERIOR.join('\n') : ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        equipamentos: {
                          ...prev.equipamentos,
                          INTERIOR: e.target.value.split('\n').filter(item => item.trim())
                        }
                      }))}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        resize: 'vertical'
                      }}
                      placeholder="Um item por linha&#10;Ar-condicionado&#10;Direção hidráulica&#10;Vidros elétricos"
                    />
                  </div>

                  {/* Exterior */}
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#1a2332', marginBottom: '8px' }}>
                      Exterior
                    </h5>
                    <textarea
                      value={editForm.equipamentos?.EXTERIOR ? editForm.equipamentos.EXTERIOR.join('\n') : ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        equipamentos: {
                          ...prev.equipamentos,
                          EXTERIOR: e.target.value.split('\n').filter(item => item.trim())
                        }
                      }))}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        resize: 'vertical'
                      }}
                      placeholder="Um item por linha&#10;Rodas de liga leve&#10;Faróis de neblina&#10;Teto solar"
                    />
                  </div>

                  {/* Segurança */}
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#1a2332', marginBottom: '8px' }}>
                      Segurança
                    </h5>
                    <textarea
                      value={editForm.equipamentos?.SEGURANÇA ? editForm.equipamentos.SEGURANÇA.join('\n') : ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        equipamentos: {
                          ...prev.equipamentos,
                          SEGURANÇA: e.target.value.split('\n').filter(item => item.trim())
                        }
                      }))}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        resize: 'vertical'
                      }}
                      placeholder="Um item por linha&#10;Airbags frontais&#10;ABS&#10;Alarme"
                    />
                  </div>

                  {/* Conforto */}
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#1a2332', marginBottom: '8px' }}>
                      Conforto
                    </h5>
                    <textarea
                      value={editForm.equipamentos?.CONFORTO ? editForm.equipamentos.CONFORTO.join('\n') : ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        equipamentos: {
                          ...prev.equipamentos,
                          CONFORTO: e.target.value.split('\n').filter(item => item.trim())
                        }
                      }))}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        resize: 'vertical'
                      }}
                      placeholder="Um item por linha&#10;Banco do motorista com regulagem&#10;Som com bluetooth&#10;USB"
                    />
                  </div>
                </div>
              </div>

              {/* Seção Especificações Técnicas */}
              <div style={{ marginTop: '32px' }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1a2332',
                  marginBottom: '16px'
                }}>
                  Especificações Técnicas
                </h4>
                

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Comprimento (mm)
                    </label>
                    <input
                      type="number"
                      value={editForm.especificacoes_tecnicas?.comprimento || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        especificacoes_tecnicas: {
                          ...prev.especificacoes_tecnicas,
                          comprimento: e.target.value
                        }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Largura (mm)
                    </label>
                    <input
                      type="number"
                      value={editForm.especificacoes_tecnicas?.largura || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        especificacoes_tecnicas: {
                          ...prev.especificacoes_tecnicas,
                          largura: e.target.value
                        }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Altura (mm)
                    </label>
                    <input
                      type="number"
                      value={editForm.especificacoes_tecnicas?.altura || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        especificacoes_tecnicas: {
                          ...prev.especificacoes_tecnicas,
                          altura: e.target.value
                        }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Porta-malas (L)
                    </label>
                    <input
                      type="number"
                      value={editForm.especificacoes_tecnicas?.porta_malas || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        especificacoes_tecnicas: {
                          ...prev.especificacoes_tecnicas,
                          porta_malas: e.target.value
                        }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Capacidade (pessoas)
                    </label>
                    <input
                      type="number"
                      value={editForm.especificacoes_tecnicas?.capacidade || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        especificacoes_tecnicas: {
                          ...prev.especificacoes_tecnicas,
                          capacidade: e.target.value
                        }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      value={editForm.especificacoes_tecnicas?.peso || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        especificacoes_tecnicas: {
                          ...prev.especificacoes_tecnicas,
                          peso: e.target.value
                        }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Potência Máxima (cv)
                    </label>
                    <input
                      type="number"
                      value={editForm.especificacoes_tecnicas?.potencia_maxima || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        especificacoes_tecnicas: {
                          ...prev.especificacoes_tecnicas,
                          potencia_maxima: e.target.value
                        }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Ex: 139"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Torque Máximo (kgfm)
                    </label>
                    <input
                      type="text"
                      value={editForm.especificacoes_tecnicas?.torque_maximo || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        especificacoes_tecnicas: {
                          ...prev.especificacoes_tecnicas,
                          torque_maximo: e.target.value
                        }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Ex: 19,3"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Consumo Urbano (km/l)
                    </label>
                    <input
                      type="text"
                      value={editForm.especificacoes_tecnicas?.consumo_urbano || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        especificacoes_tecnicas: {
                          ...prev.especificacoes_tecnicas,
                          consumo_urbano: e.target.value
                        }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Ex: 9,1"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Consumo Rodoviário (km/l)
                    </label>
                    <input
                      type="text"
                      value={editForm.especificacoes_tecnicas?.consumo_rodoviario || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        especificacoes_tecnicas: {
                          ...prev.especificacoes_tecnicas,
                          consumo_rodoviario: e.target.value
                        }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Ex: 11,7"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Autonomia Urbana (km)
                    </label>
                    <input
                      type="number"
                      value={editForm.especificacoes_tecnicas?.autonomia_urbana || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        especificacoes_tecnicas: {
                          ...prev.especificacoes_tecnicas,
                          autonomia_urbana: e.target.value
                        }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Ex: 430"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Autonomia Rodoviária (km)
                    </label>
                    <input
                      type="number"
                      value={editForm.especificacoes_tecnicas?.autonomia_rodoviaria || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        especificacoes_tecnicas: {
                          ...prev.especificacoes_tecnicas,
                          autonomia_rodoviaria: e.target.value
                        }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Ex: 550"
                    />
                  </div>
                </div>
              </div>

              {/* Botões do Modal */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* Botão Corrigir com IA */}
                  <button
                    onClick={generateCompleteInformation}
                    disabled={generatingAi}
                    style={{
                      backgroundColor: generatingAi ? '#d1d5db' : '#16A34A',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: generatingAi ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {generatingAi ? 'Corrigindo...' : '🔧 Corrigir com IA'}
                  </button>
                  
                  {/* Botão de teste */}
                  <button
                    onClick={async () => {
                      console.log('🧪 TESTE: Verificando conexão com servidor');
                      try {
                        const response = await fetch('/openai', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            prompt: 'Teste: responda apenas OK'
                          }),
                        });
                        console.log('🧪 Response status:', response.status);
                        console.log('🧪 Response headers:', response.headers);
                        const text = await response.text();
                        console.log('🧪 Response text:', text);
                        showToast('✅ Servidor respondeu!', 'success');
                      } catch (error) {
                        console.error('🧪 ERRO NO TESTE:', error);
                        showToast(`❌ Erro: ${error.message}`, 'error');
                      }
                    }}
                    style={{
                      backgroundColor: '#EF4444',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🧪 Testar API
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setShowEditModal(false)}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveVehicleChanges}
                    disabled={loading}
                    style={{
                      backgroundColor: loading ? '#d1d5db' : '#1A75FF',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aba Depoimentos */}
      {activeTab === 'testimonials' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <div>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1a2332',
                marginBottom: '8px',
                fontFamily: 'DM Sans, sans-serif'
              }}>
                Gerenciar Depoimentos
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: '16px',
                margin: 0
              }}>
                Crie, edite e gerencie os depoimentos dos clientes da Átria Veículos
              </p>
            </div>
            <button
              onClick={() => openTestimonialModal()}
              style={{
                backgroundColor: '#1A75FF',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ➕ Novo Depoimento
            </button>
          </div>

          {/* Lista de Depoimentos */}
          {testimonialsLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: '#64748b'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e2e8f0',
                borderTop: '4px solid #1A75FF',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              Carregando depoimentos...
            </div>
          ) : testimonials.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>📝</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1a2332',
                marginBottom: '8px'
              }}>
                Nenhum depoimento cadastrado
              </h3>
              <p style={{
                color: '#64748b',
                fontSize: '16px',
                marginBottom: '24px'
              }}>
                Comece criando seu primeiro depoimento de cliente
              </p>
              <button
                onClick={() => openTestimonialModal()}
                style={{
                  backgroundColor: '#1A75FF',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Criar Primeiro Depoimento
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {testimonials.map(testimonial => (
                <div
                  key={testimonial.id}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start'
                  }}>
                    {/* Foto do cliente */}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <img fetchpriority="low" decoding="async" loading="lazy" src={testimonial.foto} alt={testimonial.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => {
                          e.target.src = `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 99) + 1}.jpg`;
                        }}
                      />
                    </div>

                    {/* Conteúdo do depoimento */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <div>
                          <h4 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1a2332',
                            margin: 0,
                            marginBottom: '4px'
                          }}>
                            {testimonial.nome}
                          </h4>
                          <p style={{
                            fontSize: '14px',
                            color: '#64748b',
                            margin: 0,
                            marginBottom: '8px'
                          }}>
                            {testimonial.cidade}
                          </p>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                style={{
                                  color: i < testimonial.rating ? '#fbbf24' : '#e5e7eb',
                                  fontSize: '16px'
                                }}
                              >
                                ★
                              </span>
                            ))}
                            <span style={{
                              fontSize: '14px',
                              color: '#64748b',
                              marginLeft: '8px'
                            }}>
                              {testimonial.rating}/5
                            </span>
                          </div>
                        </div>

                        {/* Botões de ação */}
                        <div style={{
                          display: 'flex',
                          gap: '8px'
                        }}>
                          <button
                            onClick={() => openTestimonialModal(testimonial)}
                            style={{
                              backgroundColor: '#1A75FF',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteTestimonial(testimonial.id, testimonial.nome)}
                            style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>

                      {/* Texto do depoimento */}
                      <p style={{
                        fontSize: '15px',
                        color: '#374151',
                        lineHeight: '1.6',
                        margin: 0,
                        fontStyle: 'italic'
                      }}>
                        "{testimonial.depoimento}"
                      </p>

                      {/* Data de criação */}
                      {testimonial.created_at && (
                        <p style={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          margin: '12px 0 0 0'
                        }}>
                          Criado em: {new Date(testimonial.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal para criar/editar depoimento */}
      {testimonialModal.isOpen && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1a2332',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              {testimonialModal.isEditing ? 'Editar Depoimento' : 'Novo Depoimento'}
            </h3>

            {testimonialModal.error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '14px'
              }}>
                {testimonialModal.error}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); saveTestimonial(); }}>
              {/* Nome do cliente */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={testimonialForm.nome}
                  onChange={(e) => handleTestimonialFormChange('nome', e.target.value)}
                  placeholder="Ex: Maria Silva"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* URL da foto */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  URL da Foto
                </label>
                <input
                  type="url"
                  value={testimonialForm.foto}
                  onChange={(e) => handleTestimonialFormChange('foto', e.target.value)}
                  placeholder="https://randomuser.me/api/portraits/women/32.jpg"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '4px',
                  margin: '4px 0 0 0'
                }}>
                  Deixe em branco para usar foto automática do randomuser.me
                </p>
              </div>

              {/* Cidade */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Cidade/Estado
                </label>
                <input
                  type="text"
                  value={testimonialForm.cidade}
                  onChange={(e) => handleTestimonialFormChange('cidade', e.target.value)}
                  placeholder="Ex: Campinas/SP"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Avaliação */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Avaliação
                </label>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleTestimonialFormChange('rating', star)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        fontSize: '24px',
                        color: star <= testimonialForm.rating ? '#fbbf24' : '#e5e7eb',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      ★
                    </button>
                  ))}
                  <span style={{
                    fontSize: '14px',
                    color: '#64748b',
                    marginLeft: '8px'
                  }}>
                    {testimonialForm.rating}/5
                  </span>
                </div>
              </div>

              {/* Depoimento */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Depoimento *
                </label>
                <textarea
                  value={testimonialForm.depoimento}
                  onChange={(e) => handleTestimonialFormChange('depoimento', e.target.value)}
                  placeholder="Escreva o depoimento do cliente aqui..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                  required
                />
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '4px',
                  margin: '4px 0 0 0'
                }}>
                  Escreva um depoimento autêntico e positivo sobre a experiência do cliente
                </p>
              </div>

              {/* Botões de ação */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={closeTestimonialModal}
                  disabled={testimonialModal.loading}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: testimonialModal.loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={testimonialModal.loading}
                  style={{
                    backgroundColor: testimonialModal.loading ? '#9ca3af' : '#1A75FF',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: testimonialModal.loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {testimonialModal.loading && (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid currentColor',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  )}
                  {testimonialModal.loading ? 'Salvando...' : (testimonialModal.isEditing ? 'Atualizar Depoimento' : 'Criar Depoimento')}
                </button>
              </div>
            </form>
          </div>
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

      {/* Modal de Criação/Edição de Post do Blog */}
      {blogModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {/* Header do Modal */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#1A75FF',
              borderRadius: '16px 16px 0 0'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'white',
                margin: 0
              }}>
                {blogModal.isEditing ? 'Editar Post' : 'Novo Post do Blog'}
              </h3>
              <button
                onClick={closeBlogModal}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div style={{ padding: '32px' }}>
              {/* Mensagens de erro/sucesso */}
              {blogModal.error && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {blogModal.error}
                </div>
              )}

              {blogModal.success && (
                <div style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#059669',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {blogModal.success}
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); saveBlogPost(); }}>
                {/* Título do Post */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Título do Post *
                  </label>
                  <input
                    type="text"
                    value={blogForm.title}
                    onChange={(e) => handleBlogFormChange('title', e.target.value)}
                    placeholder="Digite o título do post..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                {/* Slug (URL) */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    URL do Post (Slug) *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <span style={{
                      padding: '12px 16px',
                      backgroundColor: '#f9fafb',
                      color: '#6b7280',
                      fontSize: '14px',
                      borderRight: '1px solid #d1d5db'
                    }}>
                      /blog/
                    </span>
                    <input
                      type="text"
                      value={blogForm.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="url-do-post"
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: 'none',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px',
                    margin: '4px 0 0 0'
                  }}>
                    URL amigável (apenas letras, números e hífens)
                  </p>
                </div>

                {/* Categoria */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Categoria *
                  </label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => handleBlogFormChange('category', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                    required
                  >
                    <option value="">Selecione uma categoria...</option>
                    <option value="Dicas de Compra">Dicas de Compra</option>
                    <option value="Financiamento">Financiamento</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Lançamentos">Lançamentos</option>
                    <option value="Comparativos">Comparativos</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Curiosidades">Curiosidades</option>
                  </select>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px',
                    margin: '4px 0 0 0'
                  }}>
                    Selecione uma das categorias pré-definidas
                  </p>
                </div>

                {/* Tags */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Tags (opcionais)
                  </label>
                  
                  {/* Tags selecionadas */}
                  {blogForm.tags.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      {blogForm.tags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#1A75FF',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeBlogTag(tag)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'white',
                              cursor: 'pointer',
                              padding: '0',
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Input para adicionar tags */}
                  <TagInput 
                    allTags={allBlogTags}
                    onAddTag={addBlogTag}
                    placeholder="Digite uma tag e pressione Enter..."
                  />
                  
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px',
                    margin: '4px 0 0 0'
                  }}>
                    Ex: SUV, Seminovos, Crédito. Digite e pressione Enter para adicionar.
                  </p>
                </div>

                {/* Upload de Imagem de Capa */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Imagem de Capa (JPG, PNG, WebP)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setBlogForm(prev => ({ ...prev, coverImage: file }));
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {(blogForm.coverImageUrl || blogForm.coverImage) && (
                    <div style={{ marginTop: '12px' }}>
                      <img fetchpriority="low" decoding="async" loading="lazy" src={blogForm.coverImage ? URL.createObjectURL(blogForm.coverImage) : blogForm.coverImageUrl} alt="Preview da capa" style={{ width: '200px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                  )}
                </div>

                {/* Conteúdo do Post */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Conteúdo do Post *
                  </label>
                  <textarea
                    value={blogForm.content}
                    onChange={(e) => handleBlogFormChange('content', e.target.value)}
                    placeholder="Escreva o conteúdo do post aqui..."
                    rows={12}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px',
                    margin: '4px 0 0 0'
                  }}>
                    Use quebras de linha para parágrafos. HTML básico é suportado.
                  </p>
                </div>

                {/* Opções de Publicação */}
                <div style={{ marginBottom: '32px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={blogForm.isHidden}
                      onChange={(e) => handleBlogFormChange('isHidden', e.target.checked)}
                      style={{
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <span style={{
                      fontSize: '14px',
                      color: '#374151'
                    }}>
                      Manter post oculto (não aparecerá no blog público)
                    </span>
                  </label>
                </div>

                {/* Botões de Ação */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={closeBlogModal}
                    disabled={blogModal.loading}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: blogModal.loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={blogModal.loading}
                    style={{
                      backgroundColor: blogModal.loading ? '#9ca3af' : '#1A75FF',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: blogModal.loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {blogModal.loading && (
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid currentColor',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                    )}
                    {blogModal.loading ? 'Salvando...' : (blogModal.isEditing ? 'Atualizar Post' : 'Criar Post')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPage;