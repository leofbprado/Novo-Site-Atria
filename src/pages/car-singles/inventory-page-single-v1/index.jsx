import Single1Boxcar from "@/components/carSingles/Single1Boxcar";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import FixedBottomMenu from "@/components/common/FixedBottomMenu";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import VehicleSEO from "@/components/seo/VehicleSEO";
import VehicleBreadcrumb from "@/components/common/VehicleBreadcrumb";
import { parseVehicleUrl, isLegacyUUID, buildVehicleCanonicalPath } from "@/utils/vehiclePaths";

import { allCars } from "@/data/cars";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';


import MetaComponent from "@/components/common/Metacomonent";
const metadata = {
  title: "Veículo Individual || Átria Veículos",
  description: "Detalhes do veículo - Átria Veículos",
};

export default function InventorySinglePage1() {
  let params = useParams();
  const navigate = useNavigate();
  const [carItem, setCarItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(true);

  // Cleanup de componente: proteger contra atualizações após unmount
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);
  

  
  // Scroll to top when vehicle changes
  useEffect(() => {
    if (carItem?.id) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [carItem?.id]);

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        // Extrair informações da URL usando nova estrutura: /carros/{marca}/{modelo}/{slug}
        const urlInfo = parseVehicleUrl(params);
        
        if (!urlInfo) {
          console.log('❌ URL inválida:', params);
          if (isMounted) {
            setError('URL de veículo inválida');
            setLoading(false);
          }
          return;
        }

        const { marca, modelo, ano, idRaw } = urlInfo;
        console.log('🔥 Carregando veículo:', { marca, modelo, ano, idRaw });
        setLoading(true);
        
        let vehicleData = null;
        const vehiclesRef = collection(db, 'veiculos');
        
        // Prioridade 1: Buscar por shortId (novo sistema)
        let q = query(vehiclesRef, where('shortId', '==', idRaw));
        let querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const vehicleDoc = querySnapshot.docs[0];
          vehicleData = {
            id: vehicleDoc.id,
            ...vehicleDoc.data()
          };
          console.log('✅ Veículo encontrado por shortId:', vehicleData);
        } else if (isLegacyUUID(idRaw)) {
          // Prioridade 2: Se for UUID legado, buscar por vehicle_uuid e redirecionar
          console.log('⚠️ Detectado UUID legado, buscando e redirecionando...');
          q = query(vehiclesRef, where('vehicle_uuid', '==', idRaw));
          querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const vehicleDoc = querySnapshot.docs[0];
            vehicleData = {
              id: vehicleDoc.id,
              ...vehicleDoc.data()
            };
            
            // Se o veículo tem shortId, redirecionar imediatamente
            if (vehicleData.shortId) {
              const newPath = buildVehicleCanonicalPath(vehicleData);
              if (newPath) {
                console.log('🔄 Redirecionando para URL com shortId:', newPath);
                window.history.replaceState({}, '', newPath);
                // Continue com o carregamento
              }
            }
            console.log('✅ Veículo encontrado por UUID legado:', vehicleData);
          }
        } else {
          // Prioridade 3: Tentar buscar por código (compatibilidade)
          q = query(vehiclesRef, where('codigo', '==', idRaw));
          querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const vehicleDoc = querySnapshot.docs[0];
            vehicleData = {
              id: vehicleDoc.id,
              ...vehicleDoc.data()
            };
            console.log('✅ Veículo encontrado por código:', vehicleData);
          }
        }
        
        if (vehicleData) {
          // Proteger contra atualização de estado após unmount
          if (isMounted) {
            setCarItem(vehicleData);
            setError(null);
          }
        } else {
          console.log('❌ Veículo não encontrado no Firestore');
          if (isMounted) {
            setCarItem(null);
            setError('Veículo não encontrado');
          }
        }
      } catch (err) {
        console.error('❌ Erro ao carregar veículo:', err);
        if (isMounted) {
          setError(err.message);
          setCarItem(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (params.slug && isMounted) {
      loadVehicle();
    }
  }, [params.marca, params.modelo, params.slug, isMounted, navigate]);

  // Carregar script do Credere automaticamente
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.meucredere.com.br/simulador/loja/21411055000164/veiculo/detectar.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Cleanup: remover script ao desmontar componente
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);
  if (loading) {
    return (
      <>
        <MetaComponent meta={metadata} />
        <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" white={true} />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          fontSize: '18px',
          color: '#1A75FF'
        }}>
          Carregando veículo...
        </div>
        <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
        <FixedBottomMenu />
      </>
    );
  }

  if (!carItem) {
    return (
      <>
        <MetaComponent meta={metadata} />
        <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" white={true} />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          fontSize: '18px',
          color: '#dc2626'
        }}>
          Veículo não encontrado.
        </div>
        <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
        <FixedBottomMenu />
      </>
    );
  }

  return (
    <>
      {/* SEO Component with complete meta tags, JSON-LD, and Local SEO */}
      <VehicleSEO carItem={carItem} currentUrl={window.location.href} />
      
      {/* Header - DO NOT MODIFY */}
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" white={true} />
      
      {/* Main content with proper padding */}
      <main id="page" className="page vehicle-page">
        
        <ErrorBoundary fallback={<div>Erro ao carregar veículo</div>}>
          <div key={carItem?.id || 'single'}>
            <Single1Boxcar carItem={carItem} />
          </div>
        </ErrorBoundary>
      </main>
      
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
      <FixedBottomMenu />
    </>
  );
}
