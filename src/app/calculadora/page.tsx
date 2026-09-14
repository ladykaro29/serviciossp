"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { jsPDF } from "jspdf"
import { 
  Sun, Battery, Zap, Shield, HelpCircle, ArrowRight, ArrowLeft, Plus, Minus, 
  Trash2, MessageCircle, FileText, CheckCircle2, AlertTriangle, RefreshCw, 
  Home as HomeIcon, Briefcase, Heart, CloudLightning, Info, ShieldCheck, MapPin, 
  User, Phone, Map, DollarSign, Award, Clock
} from "lucide-react"

// CONSTANTES Y CONFIGURACIONES
const IRRADIACION = 4.2; // kWh/m²/día promedio en Venezuela
const EFICIENCIA_INVERSOR = 0.95;
const FACTOR_DESCARGA = 0.9; // 90% descarga en litio
const PERDIDAS_TEMP_BATERIA = 0.1;
const PERDIDAS_CABLEADO = 0.04;
const PERDIDAS_TEMP_MODULOS = 0.1;
const PERDIDAS_DEGRADACION_FV = 0.08;

// CATÁLOGO DE INVERSORES
const INVERSORES = [
  { capacidad_kVA: 1.5, capacidad_W: 1500, voltaje: 24 },
  { capacidad_kVA: 3.0, capacidad_W: 3000, voltaje: 48 },
  { capacidad_kVA: 5.0, capacidad_W: 5000, voltaje: 48 },
  { capacidad_kVA: 6.0, capacidad_W: 6000, voltaje: 48 },
  { capacidad_kVA: 8.0, capacidad_W: 8000, voltaje: 48 },
  { capacidad_kVA: 10.0, capacidad_W: 10000, voltaje: 48 },
  { capacidad_kVA: 12.0, capacidad_W: 12000, voltaje: 48 }
];

// PANELES SOLARES
const PANELES = [
  { potencia_W: 400, precio_aprox: 120 },
  { potencia_W: 450, precio_aprox: 140 }, // Predeterminado
  { potencia_W: 550, precio_aprox: 170 }
];

// BATERÍAS DE LITIO
const BATERIAS = [
  { capacidad_Ah: 100, voltaje: 12, precio_aprox: 280 },
  { capacidad_Ah: 200, voltaje: 12, precio_aprox: 520 },
  { capacidad_Ah: 100, voltaje: 48, precio_aprox: 1100 } // Banco ideal
];

// EQUIPOS PREDETERMINADOS DEL SISTEMA
const CATALOGO_PREDETERMINADO = [
  // Refrigeración y clima
  { id: "nevera_med", nombre: "Nevera mediana (150W)", categoria: "refrigeracion", potencia_W: 150, potencia_promedio_W: 60, cantidad: 0, horas_uso: 24, uso_fijo: true, tooltip: "Las neveras modernas consumen ~150W de pico al encender, pero su compresor solo está activo un 40% del tiempo. Usamos un promedio de 60W reales para calcular tu consumo diario." },
  { id: "nevera_gde", nombre: "Nevera grande (Side-by-Side)", categoria: "refrigeracion", potencia_W: 180, potencia_promedio_W: 138, cantidad: 0, horas_uso: 24, uso_fijo: true, tooltip: "Las neveras grandes consumen ~180W promedio real considerando ciclos de deshielo y doble puerta abierta." },
  { id: "freezer", nombre: "Freezer Horizontal", categoria: "refrigeracion", potencia_W: 200, potencia_promedio_W: 70, cantidad: 0, horas_uso: 24, uso_fijo: true, tooltip: "Funciona por ciclos de compresión alrededor de 35% del tiempo." },
  { id: "aire_5k", nombre: "Aire 5,000 BTU Inverter", categoria: "refrigeracion", potencia_W: 450, potencia_promedio_W: 450, cantidad: 0, horas_uso: 6, uso_fijo: false, max_horas: 24, tipo: "aire_acondicionado", tooltip: "⚠️ Requiere inversor de mínimo 3kVA. Recomendamos usar modelos inverter para evitar picos destructivos." },
  { id: "aire_9k", nombre: "Aire 9,000 BTU Inverter", categoria: "refrigeracion", potencia_W: 800, potencia_promedio_W: 800, cantidad: 0, horas_uso: 6, uso_fijo: false, max_horas: 24, tipo: "aire_acondicionado", tooltip: "⚠️ Requiere inversor de mínimo 3kVA. Genera un consumo constante considerable durante la noche." },
  { id: "aire_12k", nombre: "Aire 12,000 BTU Inverter", categoria: "refrigeracion", potencia_W: 1200, potencia_promedio_W: 1200, cantidad: 0, horas_uso: 6, uso_fijo: false, max_horas: 24, tipo: "aire_acondicionado", tooltip: "⚠️ Requiere inversor de mínimo 6kVA para operar de forma segura con otras cargas." },
  { id: "aire_18k", nombre: "Aire 18,000 BTU Inverter", categoria: "refrigeracion", potencia_W: 1800, potencia_promedio_W: 1800, cantidad: 0, horas_uso: 6, uso_fijo: false, max_horas: 24, tipo: "aire_acondicionado", tooltip: "⚠️ Requiere inversor de mínimo 6kVA. Alto consumo, ideal para encendidos limitados." },

  // Iluminación
  { id: "led_10w", nombre: "Bombillo LED 10W", categoria: "iluminacion", potencia_W: 10, potencia_promedio_W: 10, cantidad: 0, horas_uso: 5, uso_fijo: false, max_horas: 24, tooltip: "Alta eficiencia. Reemplaza bombillos incandescentes tradicionales." },
  { id: "led_16w", nombre: "Bombillo LED 16W", categoria: "iluminacion", potencia_W: 16, potencia_promedio_W: 16, cantidad: 0, horas_uso: 5, uso_fijo: false, max_horas: 24, tooltip: "Mayor luminosidad para áreas comunes o cocinas." },
  { id: "reflector_50w", nombre: "Reflector LED Exterior 50W", categoria: "iluminacion", potencia_W: 50, potencia_promedio_W: 50, cantidad: 0, horas_uso: 10, uso_fijo: false, max_horas: 12, tooltip: "Reflector de seguridad exterior, comúnmente usado toda la noche." },

  // Electrónica
  { id: "router", nombre: "Router / Módem Internet", categoria: "electronica", potencia_W: 20, potencia_promedio_W: 20, cantidad: 0, horas_uso: 24, uso_fijo: true, tooltip: "Crucial mantenerlo encendido 24h para no perder conectividad durante apagones." },
  { id: "pc_escritorio", nombre: "Computadora Escritorio + Monitor", categoria: "electronica", potencia_W: 150, potencia_promedio_W: 150, cantidad: 0, horas_uso: 4, uso_fijo: false, max_horas: 24, tooltip: "CPU más pantalla LED de trabajo." },
  { id: "laptop", nombre: "Laptop", categoria: "electronica", potencia_W: 65, potencia_promedio_W: 65, cantidad: 0, horas_uso: 5, uso_fijo: false, max_horas: 24, tooltip: "Bajo consumo, ideal para teletrabajo y educación en casa." },
  { id: "tv_32", nombre: "Televisor LED 32\"", categoria: "electronica", potencia_W: 60, potencia_promedio_W: 60, cantidad: 0, horas_uso: 4, uso_fijo: false, max_horas: 24, tooltip: "Consumo moderado de entretenimiento familiar." },
  { id: "tv_43", nombre: "Televisor LED 43\"", categoria: "electronica", potencia_W: 80, potencia_promedio_W: 80, cantidad: 0, horas_uso: 4, uso_fijo: false, max_horas: 24, tooltip: "Consumo regular para salas de estar." },
  { id: "tv_55", nombre: "Televisor LED 55\"", categoria: "electronica", potencia_W: 120, potencia_promedio_W: 120, cantidad: 0, horas_uso: 4, uso_fijo: false, max_horas: 24, tooltip: "Mayor tamaño y consumo de energía." },

  // Entretenimiento
  { id: "consola", nombre: "PlayStation / Xbox / Switch", categoria: "entretenimiento", potencia_W: 150, potencia_promedio_W: 150, cantidad: 0, horas_uso: 2, uso_fijo: false, max_horas: 24, tooltip: "Consolas de juegos de última generación." },
  { id: "sonido", nombre: "Equipo de Sonido / Corneta", categoria: "entretenimiento", potencia_W: 100, potencia_promedio_W: 100, cantidad: 0, horas_uso: 3, uso_fijo: false, max_horas: 24, tooltip: "Consumo variable según el volumen." },

  // Seguridad
  { id: "camara_ip", nombre: "Cámara de Seguridad IP (c/u)", categoria: "seguridad", potencia_W: 10, potencia_promedio_W: 10, cantidad: 0, horas_uso: 24, uso_fijo: true, tooltip: "Sistema de vigilancia constante de 24 horas." },
  { id: "dvr_4", nombre: "DVR Grabador 4 canales", categoria: "seguridad", potencia_W: 40, potencia_promedio_W: 40, cantidad: 0, horas_uso: 24, uso_fijo: true, tooltip: "Grabación continua y alimentación de cámaras analógicas." },
  { id: "dvr_8", nombre: "DVR Grabador 8 canales", categoria: "seguridad", potencia_W: 60, potencia_promedio_W: 60, cantidad: 0, horas_uso: 24, uso_fijo: true, tooltip: "DVR de mayor capacidad de cámaras y discos duros." },

  // Ventilación
  { id: "vent_techo", nombre: "Ventilador de Techo", categoria: "ventilacion", potencia_W: 75, potencia_promedio_W: 75, cantidad: 0, horas_uso: 8, uso_fijo: false, max_horas: 24, tooltip: "Esencial para disipar el calor caribeño de forma eficiente." },
  { id: "vent_pedestal", nombre: "Ventilador de Pedestal", categoria: "ventilacion", potencia_W: 60, potencia_promedio_W: 60, cantidad: 0, horas_uso: 8, uso_fijo: false, max_horas: 24, tooltip: "Consumo moderado para habitaciones o salas." },

  // Cocina y Electrodomésticos
  { id: "microondas_700", nombre: "Microondas 700W", categoria: "cocina", potencia_W: 1050, potencia_promedio_W: 1050, cantidad: 0, horas_uso: 0.25, uso_fijo: false, max_horas: 2, esMinutos: true, tooltip: "⚠️ Consume mucha potencia en ráfagas cortas. Los 700W son potencia útil, requiere unos 1,050W de entrada." },
  { id: "licuadora", nombre: "Licuadora 3 Velocidades", categoria: "cocina", potencia_W: 400, potencia_promedio_W: 400, cantidad: 0, horas_uso: 0.15, uso_fijo: false, max_horas: 1, esMinutos: true, tooltip: "Uso esporádico (minutos) de alta potencia de arranque." },
  { id: "cafetera", nombre: "Cafetera de Filtro", categoria: "cocina", potencia_W: 900, potencia_promedio_W: 900, cantidad: 0, horas_uso: 0.25, uso_fijo: false, max_horas: 2, esMinutos: true, tooltip: "⚠️ Calentamiento rápido por resistencia. Alto consumo en ráfaga." },
  { id: "plancha", nombre: "Plancha de Ropa", categoria: "cocina", potencia_W: 1200, potencia_promedio_W: 1200, cantidad: 0, horas_uso: 0.5, uso_fijo: false, max_horas: 4, tipo: "no_recomendado", tooltip: "❌ NO recomendado en sistemas solares off-grid pequeños. Agota las baterías extremadamente rápido." },
  { id: "lavadora", nombre: "Lavadora Semiautomática", categoria: "cocina", potencia_W: 500, potencia_promedio_W: 500, cantidad: 0, horas_uso: 1, uso_fijo: false, max_horas: 6, tipo: "evaluar_carga", tooltip: "⚠️ Evaluar capacidad del sistema. Se recomienda lavar solo en horas de alta irradiación (10am a 2pm)." },
  { id: "secadora", nombre: "Secadora de Ropa", categoria: "cocina", potencia_W: 3000, potencia_promedio_W: 3000, cantidad: 0, horas_uso: 0, uso_fijo: false, max_horas: 0, tipo: "prohibido", tooltip: "❌ Incompatible con sistemas residenciales normales. Requiere trifásica o gas." },

  // Oficina / Trabajo
  { id: "impresora_laser", nombre: "Impresora Láser Oficina", categoria: "oficina", potencia_W: 400, potencia_promedio_W: 400, cantidad: 0, horas_uso: 1, uso_fijo: false, max_horas: 12, tooltip: "Picos altos al fundir el tóner. Usar solo cuando sea necesario." },
  { id: "punto_venta", nombre: "Punto de Venta (POS)", categoria: "oficina", potencia_W: 30, potencia_promedio_W: 30, cantidad: 0, horas_uso: 8, uso_fijo: false, max_horas: 24, tooltip: "Esencial para comercios venezolanos durante fallas eléctricas." },
  { id: "fotocopiadora", nombre: "Fotocopiadora Comercial", categoria: "oficina", potencia_W: 300, potencia_promedio_W: 300, cantidad: 0, horas_uso: 2, uso_fijo: false, max_horas: 12, tooltip: "Consumo moderado a alto según ciclo de impresión." },

  // Agua (Opcional)
  { id: "bomba_05hp", nombre: "Bomba de Agua 0.5 HP", categoria: "agua", potencia_W: 373, potencia_promedio_W: 373, cantidad: 0, horas_uso: 0.5, uso_fijo: false, max_horas: 4, esMinutos: true, tipo: "bomba_agua", tooltip: "⚠️ Uso manual sugerido. Encender para llenar tanque y apagar. Evita el encendido automático constante." },
  { id: "bomba_1hp", nombre: "Bomba de Agua 1.0 HP", categoria: "agua", potencia_W: 746, potencia_promedio_W: 746, cantidad: 0, horas_uso: 0.5, uso_fijo: false, max_horas: 4, esMinutos: true, tipo: "bomba_agua", tooltip: "⚠️ Alto arranque inductivo. Requiere inversores de mínimo 3kVA de onda pura." }
];

export default function CalculadoraSolar() {
  const [step, setStep] = useState(1);
  const [horasCorte, setHorasCorte] = useState(6);
  const [horarioCorte, setHorarioCorte] = useState("Tarde");
  const [proposito, setProposito] = useState("Casa/Apartamento");
  const [activeCategory, setActiveCategory] = useState("refrigeracion");
  const [equipos, setEquipos] = useState(CATALOGO_PREDETERMINADO);
  
  // Guardado de historial / Comparaciones
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number | null>(null);

  // Datos de Leads
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadCity, setLeadCity] = useState("El Vigía");
  const [financing, setFinancing] = useState(false);
  const [visitRequest, setVisitRequest] = useState(false);

  // Alertas / Modales
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [showPumpModal, setShowPumpModal] = useState(false);
  const [hasPreviousData, setHasPreviousData] = useState(false);

  // Cargar localStorage al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem("sp_solar_calc");
    if (savedData) {
      setHasPreviousData(true);
    }
  }, []);

  const recuperarDatos = () => {
    const savedData = localStorage.getItem("sp_solar_calc");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.horasCorte !== undefined) setHorasCorte(parsed.horasCorte);
        if (parsed.horarioCorte) setHorarioCorte(parsed.horarioCorte);
        if (parsed.proposito) setProposito(parsed.proposito);
        if (parsed.equipos) {
          // Fusionar con catálogo completo por si hay nuevos
          const merged = CATALOGO_PREDETERMINADO.map(def => {
            const found = parsed.equipos.find((e: any) => e.id === def.id);
            return found ? { ...def, cantidad: found.cantidad, horas_uso: found.horas_uso } : def;
          });
          setEquipos(merged);
        }
        setHasPreviousData(false);
      } catch (err) {
        console.error("Error cargando cálculo previo", err);
      }
    }
  };

  const guardarEnLocalStorage = (currentEquipos = equipos) => {
    const dataToSave = {
      horasCorte,
      horarioCorte,
      proposito,
      equipos: currentEquipos.map(e => ({ id: e.id, cantidad: e.cantidad, horas_uso: e.horas_uso }))
    };
    localStorage.setItem("sp_solar_calc", JSON.stringify(dataToSave));
  };

  // Modificar cantidades de equipos
  const handleQtyChange = (id: string, delta: number) => {
    const updated = equipos.map(equipo => {
      if (equipo.id === id) {
        const newQty = Math.max(0, equipo.cantidad + delta);
        // Validaciones especiales como bomba de agua modal
        if (newQty > 0 && equipo.tipo === "bomba_agua" && equipo.cantidad === 0) {
          setShowPumpModal(true);
        }
        return { ...equipo, cantidad: newQty };
      }
      return equipo;
    });
    setEquipos(updated);
    guardarEnLocalStorage(updated);
  };

  // Modificar horas de uso
  const handleHorasChange = (id: string, val: number) => {
    const updated = equipos.map(equipo => {
      if (equipo.id === id) {
        return { ...equipo, horas_uso: val };
      }
      return equipo;
    });
    setEquipos(updated);
    guardarEnLocalStorage(updated);
  };

  // Resetear todo
  const resetearCalculadora = () => {
    if (window.confirm("¿Estás seguro de que deseas limpiar todo tu cálculo actual?")) {
      setEquipos(CATALOGO_PREDETERMINADO.map(e => ({ ...e, cantidad: 0 })));
      setHorasCorte(6);
      setHorarioCorte("Tarde");
      setProposito("Casa/Apartamento");
      localStorage.removeItem("sp_solar_calc");
      setStep(1);
    }
  };

  // CÁLCULOS PRINCIPALES DEL SISTEMA
  const selectedEquipos = equipos.filter(e => e.cantidad > 0);
  
  // 1. Consumo Diario Wh y pico
  let consumoTotal_Wh = 0;
  let potenciaPico_W = 0;
  let tieneBomba = false;
  let tieneAires = false;
  let tieneAiresGrandes = false;

  selectedEquipos.forEach(e => {
    // Para neveras usamos potencia promedio_W, para el resto usamos potencia_W normal
    const runningPower = e.potencia_promedio_W;
    const Wh = e.cantidad * runningPower * e.horas_uso;
    consumoTotal_Wh += Wh;

    // Para potencia pico consideramos el encendido
    potenciaPico_W += (e.cantidad * e.potencia_W);

    if (e.tipo === "bomba_agua") tieneBomba = true;
    if (e.tipo === "aire_acondicionado") {
      tieneAires = true;
      if (e.potencia_W >= 1200) tieneAiresGrandes = true;
    }
  });

  // Consumo mensual kWh
  const consumoMensual_kWh = (consumoTotal_Wh * 30) / 1000;

  // 2. Determinar Inversor
  let inversorSeleccionado = INVERSORES[0]; // 1.5kVA base
  
  // Encontrar el inversor adecuado basado en la potencia pico * 1.25 (factor de arranque)
  const potenciaArranqueRequerida = potenciaPico_W * 1.25;

  for (let inv of INVERSORES) {
    if (inv.capacidad_W >= potenciaArranqueRequerida) {
      inversorSeleccionado = inv;
      break;
    }
  }

  // Reglas forzadas por tipo de equipos
  if (tieneAires && !tieneAiresGrandes && inversorSeleccionado.capacidad_kVA < 3) {
    // 5k-9k BTU require 3kVA mínimo
    inversorSeleccionado = INVERSORES.find(inv => inv.capacidad_kVA === 3.0) || INVERSORES[1];
  }
  if (tieneAiresGrandes && inversorSeleccionado.capacidad_kVA < 6) {
    // >= 12k BTU require 6kVA mínimo
    inversorSeleccionado = INVERSORES.find(inv => inv.capacidad_kVA === 6.0) || INVERSORES[3];
  }
  
  // Si supera 12kW o potencia excesiva
  if (potenciaArranqueRequerida > 12000) {
    inversorSeleccionado = INVERSORES[INVERSORES.length - 1]; // 12kVA tope
  }

  const voltajeBanco = inversorSeleccionado.voltaje;

  // 3. Baterías Necesarias
  // Wh requeridos de respaldo durante cortes = consumo diario total prorrateado por las horas de corte
  // Pero para off-grid aislado, calculamos la autonomía del día completo
  const capacidadAh_Basica = (consumoTotal_Wh * (1 + PERDIDAS_CABLEADO)) / 
                             EFICIENCIA_INVERSOR / voltajeBanco / (1 - PERDIDAS_TEMP_BATERIA);
  
  const capacidadAh_Ajustada = (consumoTotal_Wh * (1 + PERDIDAS_CABLEADO)) / 
                               EFICIENCIA_INVERSOR / voltajeBanco / FACTOR_DESCARGA / (1 - PERDIDAS_TEMP_BATERIA);

  // Seleccionar batería ideal según voltaje
  // Si banco es 24V -> Usar baterías de 12V 200Ah conectadas en serie (2 baterías = 24V 200Ah)
  // Si banco es 48V -> Usar batería de Litio integrada de 48V 100Ah
  let bateriaSeleccionada = BATERIAS[0];
  let numBaterias = 1;

  if (voltajeBanco === 24) {
    bateriaSeleccionada = BATERIAS[1]; // 12V 200Ah ($520)
    // Se necesitan parejas en serie para dar 24V.
    const capacidadNecesaria_Ah = capacidadAh_Ajustada;
    const parejas = Math.ceil(capacidadNecesaria_Ah / 200);
    numBaterias = parejas * 2; // Parejas de 2
  } else {
    // 48V
    bateriaSeleccionada = BATERIAS[2]; // 48V 100Ah ($1100)
    numBaterias = Math.ceil(capacidadAh_Ajustada / 100);
  }

  // Si numBaterias es cero, usar mínimo 1 banco
  if (numBaterias <= 0) numBaterias = voltajeBanco === 24 ? 2 : 1;

  const capacidadReal_Ah = (voltajeBanco === 24) ? (numBaterias / 2) * 200 : numBaterias * 100;
  const energiaBaterias_kWh = (capacidadReal_Ah * voltajeBanco) / 1000;

  // 4. Paneles Necesarios
  const energiaGenerada_kWh = (capacidadAh_Basica * 1.9 * voltajeBanco) / 1000;
  const potenciaPaneles_Wp = (energiaGenerada_kWh / IRRADIACION / 
                             (1 - PERDIDAS_DEGRADACION_FV) / (1 - PERDIDAS_TEMP_MODULOS)) * 1000;

  // Usar panel recomendado de 450W
  const panelSeleccionado = PANELES[1];
  let numPaneles = Math.ceil(potenciaPaneles_Wp / panelSeleccionado.potencia_W);
  if (numPaneles < 2 && consumoTotal_Wh > 0) numPaneles = 2; // Mínimo 2 paneles en serie típicamente para cargar baterías
  if (consumoTotal_Wh === 0) numPaneles = 0;

  // 5. Autonomía Real
  const potenciaUsoPromedio = consumoTotal_Wh / 24 || 1;
  const autonomiaHoras = (capacidadReal_Ah * voltajeBanco * FACTOR_DESCARGA) / potenciaUsoPromedio;

  // 6. Precios y Margen de inversión según complejidad en el sitio
  const precioInversor = inversorSeleccionado.capacidad_kVA * 380; 
  const precioPaneles = numPaneles * panelSeleccionado.precio_aprox;
  const precioBaterias = numBaterias * bateriaSeleccionada.precio_aprox;
  // Instalación premium en Venezuela (varía según cableado, altura, soportes coplanares o inclinados)
  const precioInstalacionYHerrajes = (precioInversor + precioPaneles + precioBaterias) * 0.22;

  // Rango total de inversión para el cliente (Min - Max basado en el trabajo del lugar)
  const precioBaseTotal = precioInversor + precioPaneles + precioBaterias + precioInstalacionYHerrajes;
  const precioMin = Math.round(precioBaseTotal * 0.90 / 50) * 50; // Redondeado a múltiplos de 50
  const precioMax = Math.round(precioBaseTotal * 1.15 / 50) * 50;

  // ROI aproximado comparado con plantas eléctricas de gasolina + mantenimiento
  const mesesROI = consumoTotal_Wh > 0 ? Math.round(36 + (precioBaseTotal / 120)) : 0;

  // Alertas automáticas
  const alertas = [];
  if (potenciaPico_W > 12000) {
    alertas.push({
      tipo: "error",
      mensaje: "⚠️ Tu carga pico supera los 12kW recomendados residenciales. Tu proyecto requiere múltiples inversores híbridos en paralelo. Un ingeniero te atenderá directamente."
    });
  }
  if (consumoTotal_Wh < 500 && consumoTotal_Wh > 0) {
    alertas.push({
      tipo: "info",
      mensaje: "💡 Tu consumo es muy bajo. Verifica si olvidaste agregar equipos esenciales como bombillos o ventiladores."
    });
  }
  equipos.forEach(eq => {
    if (eq.cantidad > 0 && eq.tipo === "no_recomendado") {
      alertas.push({
        tipo: "warning",
        mensaje: `⚠️ Has seleccionado Plancha. Las planchas consumen resistencia pura y desgastan aceleradamente las baterías de litio. Úsala con precaución extrema.`
      });
    }
  });

  // MODO COMPARACIÓN (ESCENARIOS)
  const guardarEscenario = () => {
    const esc = {
      name: `Escenario ${scenarios.length + 1} (${proposito})`,
      consumoDiario: (consumoTotal_Wh / 1000).toFixed(2),
      inversor: `${inversorSeleccionado.capacidad_kVA} kVA`,
      paneles: `${numPaneles} de 450W`,
      baterias: `${numBaterias} x ${bateriaSeleccionada.capacidad_Ah}Ah`,
      inversion: `$${precioMin} - $${precioMax}`
    };
    setScenarios([...scenarios, esc]);
    alert("¡Escenario actual guardado con éxito! Puedes compararlo en el panel de resultados.");
  };

  const eliminarEscenario = (idx: number) => {
    setScenarios(scenarios.filter((_, i) => i !== idx));
  };

  // ENVIAR POR WHATSAPP
  const handleWhatsAppSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) {
      alert("Por favor ingresa tu nombre y teléfono para enviar la cotización.");
      return;
    }

    const financingText = financing ? "☑️ Sí, me interesa financiamiento." : "☐ No requiero financiamiento.";
    const visitText = visitRequest ? "☑️ Solicito visita técnica GRATIS en mi propiedad." : "☐ Por ahora solo cotización digital.";

    const message = `Hola Servicios SP, completé la calculadora solar off-grid y obtuve este resultado técnico:

👤 *Cliente:* ${leadName}
📞 *WhatsApp:* ${leadPhone}
📍 *Ubicación:* ${leadCity}
🏠 *Tipo de Propiedad:* ${proposito}
⚡ *Cortes de luz:* ${horasCorte} hrs al día, horario ${horarioCorte}

📊 *Mi consumo diario estimado:* ${(consumoTotal_Wh / 1000).toFixed(2)} kWh/día
📈 *Consumo mensual:* ${consumoMensual_kWh.toFixed(2)} kWh/mes
⚡ *Potencia pico simulada:* ${potenciaPico_W} W

🛠️ *Sistema Solar Recomendado:*
• *Inversor Híbrido:* ${inversorSeleccionado.capacidad_kVA} kVA (Onda Pura, Banco ${voltajeBanco}V)
• *Baterías Litio:* ${numBaterias} unidades de ${bateriaSeleccionada.capacidad_Ah}Ah (Banco total: ${capacidadReal_Ah}Ah - ${voltajeBanco}V)
• *Paneles Solares:* ${numPaneles} paneles de 450Wp (Potencia total: ${numPaneles * 450} Wp)
🔋 *Autonomía estimada:* ${autonomiaHoras.toFixed(1)} horas sin sol

💰 *Rango de inversión estimado:* $${precioMin} - $${precioMax} USD
*(Nota: El rango puede variar según las condiciones estructurales y cableado en el lugar).*

${financingText}
${visitText}

¿Pueden contactarme para una cotización formal y agendar la visita?`;

    const encodedText = encodeURIComponent(message);
    const waUrl = `https://wa.me/584147550091?text=${encodedText}`;
    window.open(waUrl, "_blank");
  };

  // GENERACIÓN DE PDF PROFESIONAL CON jsPDF
  const descargarPDF = () => {
    if (!leadName) {
      alert("Por favor ingresa tu nombre para poder personalizar tu PDF de cotización.");
      setStep(3); // Ir al paso de cotización
      const formElem = document.getElementById("lead-form");
      if (formElem) formElem.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const primaryColor = [4, 17, 36]; // Navy
    const secondaryColor = [255, 98, 0]; // Orange
    const lightBg = [244, 246, 251]; // Grayish Blue

    // Cabezal Membrete
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, "F");

    // Título de la empresa en el PDF
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SERVICIOS Y SUMINISTROS SP", 15, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(230, 230, 230);
    doc.text("Soluciones Energéticas Fotovoltaicas y Seguridad", 15, 25);
    doc.text("RIF: J-40403649-0 | El Vigía, Mérida, Venezuela | Tel: 0414-7550091", 15, 30);

    // Etiqueta de la derecha
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(145, 10, 50, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("PROPUESTA PRELIMINAR", 148, 15);

    // Datos del Cliente y Situación Eléctrica
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMACIÓN GENERAL DEL CLIENTE", 15, 55);

    doc.setDrawColor(200, 200, 200);
    doc.line(15, 57, 195, 57);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Cliente: ${leadName}`, 15, 65);
    doc.text(`Ciudad/Zona: ${leadCity}`, 15, 71);
    doc.text(`Teléfono: ${leadPhone}`, 15, 77);

    doc.text(`Cortes Eléctricos Promedio: ${horasCorte} horas/día`, 110, 65);
    doc.text(`Horario habitual de cortes: ${horarioCorte}`, 110, 71);
    doc.text(`Propósito del sistema: ${proposito}`, 110, 77);

    // Resumen de consumo
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(15, 87, 180, 22, "F");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("RESUMEN DE CONSUMO ELÉCTRICO ESTIMADO", 20, 93);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`• Consumo Diario: ${(consumoTotal_Wh / 1000).toFixed(2)} kWh/día`, 20, 101);
    doc.text(`• Consumo Mensual: ${consumoMensual_kWh.toFixed(2)} kWh/mes`, 85, 101);
    doc.text(`• Potencia de Pico Simultánea: ${potenciaPico_W} W`, 140, 101);

    // Sistema solar recomendado
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("SISTEMA SOLAR FOTOVOLTAICO RECOMENDADO", 15, 122);
    doc.line(15, 124, 195, 124);

    // Tabla de Equipamiento Recomendado
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, 130, 180, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Componente del Sistema", 20, 135);
    doc.text("Especificación Técnica", 85, 135);
    doc.text("Cantidad", 170, 135);

    // Fila 1: Paneles Solares
    doc.setFillColor(255, 255, 255);
    doc.rect(15, 137, 180, 8, "F");
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.text("Módulos Solares (Paneles)", 20, 142);
    doc.text(`Panel Monocristalino de ${panelSeleccionado.potencia_W}Wp (${numPaneles * panelSeleccionado.potencia_W} Wp total)`, 85, 142);
    doc.text(`${numPaneles} uds`, 170, 142);

    // Fila 2: Baterías
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(15, 145, 180, 8, "F");
    doc.text("Banco de Baterías", 20, 150);
    doc.text(`Batería Litio ${bateriaSeleccionada.capacidad_Ah}Ah - ${bateriaSeleccionada.voltaje}V (Banco total ${capacidadReal_Ah}Ah/${voltajeBanco}V)`, 85, 150);
    doc.text(`${numBaterias} uds`, 170, 150);

    // Fila 3: Inversor
    doc.setFillColor(255, 255, 255);
    doc.rect(15, 153, 180, 8, "F");
    doc.text("Inversor Híbrido", 20, 158);
    doc.text(`Inversor de Onda Pura ${inversorSeleccionado.capacidad_kVA} kVA / ${inversorSeleccionado.capacidad_W}W (${voltajeBanco}V)`, 85, 158);
    doc.text("1 ud", 170, 158);

    // Fila 4: Estructura, Cableado y Protecciones
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(15, 161, 180, 8, "F");
    doc.text("Protecciones y Conectores", 20, 166);
    doc.text("Fusibles DC, Breakers AC/DC, Cables Solares 10AWG, Tablero y Conectores MC4", 85, 166);
    doc.text("Completo", 170, 166);

    // Fila 5: Instalación
    doc.setFillColor(255, 255, 255);
    doc.rect(15, 169, 180, 8, "F");
    doc.text("Servicio de Instalación", 20, 174);
    doc.text("Montaje mecánico premium, calibración del inversor y puesta en marcha", 85, 174);
    doc.text("Incluido", 170, 174);

    // Rango de inversión y advertencia física
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(15, 185, 180, 32, "F");
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("RANGO DE INVERSIÓN TOTAL ESTIMADO", 20, 192);

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(18);
    doc.text(`$${precioMin} - $${precioMax} USD`, 20, 201);

    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("*Nota: La inversión varía según la complejidad estructural del techo, la distancia de cableado necesaria", 20, 208);
    doc.text("y las adecuaciones eléctricas requeridas en el sitio. La cotización final y exacta requiere visita técnica.", 20, 212);

    // Garantías y Beneficios
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("✓ 25 Años de Garantía en Paneles Solares", 15, 230);
    doc.text("✓ 5 a 10 Años de Garantía en Baterías de Litio", 15, 236);
    doc.text("✓ Onda Pura Certificada ideal para equipos médicos y refrigeración", 15, 242);
    doc.text(`✓ Autonomía estimada ante apagones continuos: ${autonomiaHoras.toFixed(1)} horas de respaldo`, 110, 230);
    doc.text(`✓ Retorno de inversión estimado: ~${mesesROI} meses`, 110, 236);

    // Firmas del membrete inferior
    doc.setDrawColor(220, 220, 220);
    doc.line(15, 260, 195, 260);

    doc.setTextColor(140, 140, 140);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Documento generado de forma digital en la Calculadora de Carga de Servicios y Suministros SP.", 15, 266);
    doc.text("Válido como estimación técnica de cargas. No representa un compromiso de precios final sin visita previa.", 15, 271);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("¡PREPARA TU HOGAR CONTRA APAGONES CON EL PODER DEL SOL!", 15, 280);

    doc.save(`Cotizacion_Solar_SP_${leadName.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="min-h-screen bg-mesh text-foreground font-sans relative overflow-hidden flex flex-col">
      {/* Background Decorative Blobs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <main className="flex-grow container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <Link href="/" className="flex items-center text-xs uppercase tracking-widest font-black text-white/50 hover:text-secondary transition-colors gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
          <div className="flex items-center gap-4">
            {hasPreviousData && (
              <button 
                onClick={recuperarDatos}
                className="flex items-center gap-2 bg-secondary/15 hover:bg-secondary/25 border border-secondary/35 text-secondary text-xs font-black px-4 py-2 rounded-xl transition-all uppercase tracking-widest"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Recuperar anterior
              </button>
            )}
            <button 
              onClick={resetearCalculadora} 
              className="text-xs uppercase tracking-widest font-black text-red-500/70 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Limpiar Todo
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <div className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary text-xs font-black uppercase tracking-[0.2em] rounded-full">
            Calculadora Solar Off-Grid Premium ⚡
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
            Diseña tu sistema de <span className="text-gradient">Respaldo Solar</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg">
            Evita los apagones constantes en Venezuela. Simula tu consumo en tiempo real y obtén un dimensionamiento preciso de paneles, inversor y baterías de litio.
          </p>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-white/40 mb-3 px-2">
            <span className={step >= 1 ? "text-secondary" : ""}>1. Situación Eléctrica</span>
            <span className={step >= 2 ? "text-secondary" : ""}>2. Selección de Equipos</span>
            <span className={step >= 3 ? "text-secondary" : ""}>3. Resultados & Propuesta</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-secondary to-orange-400 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* =======================================================
            STEP 1: SITUACIÓN ELÉCTRICA
            ======================================================= */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto glass-dark border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[60px] pointer-events-none"></div>

            <h2 className="text-2xl md:text-3xl font-black text-white mb-8 border-b border-white/5 pb-4 flex items-center gap-3">
              <CloudLightning className="text-secondary w-8 h-8" />
              1. Cuéntanos sobre tu situación eléctrica actual
            </h2>

            <div className="space-y-12">
              {/* Slider 1: Horas sin luz */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-black uppercase tracking-widest text-white/80 block">
                    ¿Cuántas horas al día tienes SIN luz en promedio?
                  </label>
                  <span className="text-3xl font-black text-secondary font-mono tracking-tight bg-secondary/10 px-4 py-1 rounded-xl">
                    {horasCorte} horas
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="24" 
                  value={horasCorte} 
                  onChange={(e) => setHorasCorte(parseInt(e.target.value))}
                  className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-secondary focus:outline-none"
                />
                
                {/* Emoji Feedback block */}
                <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-5 rounded-2xl transition-all duration-300">
                  <div className="text-4xl">
                    {horasCorte <= 4 && "😊"}
                    {horasCorte > 4 && horasCorte <= 8 && "😐"}
                    {horasCorte > 8 && horasCorte <= 16 && "😟"}
                    {horasCorte > 16 && "😱"}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">
                      {horasCorte <= 4 && "Cortes leves"}
                      {horasCorte > 4 && horasCorte <= 8 && "Cortes moderados"}
                      {horasCorte > 8 && horasCorte <= 16 && "Cortes severos"}
                      {horasCorte > 16 && "Sin servicio / Off-Grid Total"}
                    </h4>
                    <p className="text-xs text-white/50 mt-1">
                      {horasCorte <= 4 && "Un sistema básico o híbrido protegerá tus equipos electrónicos e iluminación principal perfectamente."}
                      {horasCorte > 4 && horasCorte <= 8 && "Tu comodidad se ve comprometida. Diseñaremos un sistema intermedio para neveras y ventilación duradera."}
                      {horasCorte > 8 && horasCorte <= 16 && "Situación crítica. Requieres autonomía robusta para mantener neveras, internet, iluminación y bombas de agua."}
                      {horasCorte > 16 && "Aislamiento energético total. Requieres una solución premium sobredimensionada para no depender de la red pública nunca."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid 2: Horario de Cortes */}
              <div className="space-y-6">
                <label className="text-sm font-black uppercase tracking-widest text-white/80 block">
                  ¿En qué horario suelen ser más frecuentes los cortes?
                </label>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Mañana", desc: "8 AM - 12 PM", icon: "🌅" },
                    { label: "Tarde", desc: "12 PM - 6 PM", icon: "☀️" },
                    { label: "Noche", desc: "6 PM - 12 AM", icon: "🌙" },
                    { label: "Todo el día", desc: "Cortes continuos", icon: "⚡" },
                    { label: "Aleatorio", desc: "Sin horario fijo", icon: "🎲" }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setHorarioCorte(item.label)}
                      className={`p-5 rounded-2xl border text-center transition-all duration-300 ${
                        horarioCorte === item.label
                          ? "border-secondary bg-secondary/10 shadow-[0_0_20px_rgba(255,98,0,0.15)] text-white scale-[1.03]"
                          : "border-white/5 bg-white/5 text-white/70 hover:border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="font-bold text-xs uppercase tracking-wider">{item.label}</div>
                      <div className="text-[10px] text-white/40 mt-1">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid 3: Propósito del sistema */}
              <div className="space-y-6">
                <label className="text-sm font-black uppercase tracking-widest text-white/80 block">
                  ¿Para qué tipo de inmueble necesitas el sistema solar?
                </label>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { label: "Casa/Apartamento", icon: HomeIcon, desc: "Respaldo y confort familiar" },
                    { label: "Negocio/Local", icon: Briefcase, desc: "Puntos de venta y neveras" },
                    { label: "Oficina", icon: Zap, desc: "Laptops, servidores y router" },
                    { label: "Consultorio médico", icon: Heart, desc: "Preservación médica crítica" },
                    { label: "Finca/Campo", icon: Sun, desc: "Bomba de agua y cercas" }
                  ].map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setProposito(item.label)}
                        className={`p-6 rounded-3xl border text-center flex flex-col items-center justify-between min-h-[160px] transition-all duration-300 ${
                          proposito === item.label
                            ? "border-secondary bg-secondary/10 shadow-[0_0_20px_rgba(255,98,0,0.15)] text-white scale-[1.03]"
                            : "border-white/5 bg-white/5 text-white/60 hover:border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                          proposito === item.label ? "bg-secondary text-white" : "bg-white/5 text-white/70"
                        }`}>
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-xs uppercase tracking-wider mb-1">{item.label}</div>
                          <p className="text-[10px] text-white/40 leading-tight">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="mt-12 pt-6 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setStep(2);
                  window.scrollTo({ top: 180, behavior: "smooth" });
                }}
                className="bg-secondary hover:bg-secondary/90 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-secondary/10 hover:shadow-secondary/20 transition-all hover:scale-105 flex items-center gap-3 text-xs uppercase tracking-widest"
              >
                Siguiente: Seleccionar Equipos <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =======================================================
            STEP 2: SELECCIÓN DE EQUIPOS (VISTA E-COMMERCE)
            ======================================================= */}
        {step === 2 && (
          <div className="flex flex-col lg:flex-row gap-8 items-start animate-in fade-in zoom-in-95 duration-300">
            {/* Left Content Area: Tabs and Product Cards */}
            <div className="w-full lg:w-2/3 space-y-6">
              <div className="glass-dark border border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
                      <Zap className="text-secondary w-6 h-6" />
                      2. Selecciona los equipos que necesitas respaldar
                    </h2>
                    <p className="text-white/40 text-xs mt-1">
                      Agrega las cantidades y configura las horas de uso estimadas para cada electrodoméstico.
                    </p>
                  </div>
                </div>

                {/* Categories Tab Scroll */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-white/5 scrollbar-thin scrollbar-thumb-white/10">
                  {[
                    { id: "refrigeracion", label: "❄️ Frío y Clima" },
                    { id: "iluminacion", label: "💡 Iluminación" },
                    { id: "electronica", label: "📱 Electrónica" },
                    { id: "entretenimiento", label: "🎮 Ocio y Sonido" },
                    { id: "seguridad", label: "🔒 Seguridad" },
                    { id: "ventilacion", label: "🌀 Ventilación" },
                    { id: "cocina", label: "🍳 Cocina / Hogar" },
                    { id: "oficina", label: "💼 Trabajo/POS" },
                    { id: "agua", label: "💧 Agua / Bombas" }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                        activeCategory === cat.id
                          ? "bg-secondary/15 border-secondary text-secondary"
                          : "bg-white/5 border-white/5 text-white/60 hover:border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Warning Alert Banner for Inductive/High Cargas */}
                {activeCategory === "agua" && (
                  <div className="mb-6 bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-2xl text-xs flex gap-3 items-start">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">⚠️ USO MANUAL RECOMENDADO:</span> Las bombas de agua tienen motores de inducción con consumos de arranque masivos. Para sistemas solares aislados, sugerimos encender la bomba de manera <strong>manual</strong> por tiempos cortos (15-60 min) únicamente para llenar tu tanque aéreo y mantenerla apagada de manera automática. Esto reduce drásticamente el tamaño y costo del banco de baterías.
                    </div>
                  </div>
                )}

                {activeCategory === "cocina" && (
                  <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">❌ RECOMENDACIÓN DE RESISTENCIAS:</span> Equipos como planchas de ropa y secadoras generan calor mediante resistencias puras de alto amperaje. No se recomiendan en sistemas solares residenciales típicos ya que pueden agotar tu batería de litio completa en cuestión de minutos. Úsalos con precaución extrema y solo en días soleados.
                    </div>
                  </div>
                )}

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipos
                    .filter(e => e.categoria === activeCategory)
                    .map((equipo) => (
                      <div 
                        key={equipo.id} 
                        className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                          equipo.cantidad > 0 
                            ? "border-secondary/30 bg-secondary/5" 
                            : "border-white/5 bg-white/5 hover:border-white/10"
                        }`}
                      >
                        {/* Upper Section of Card */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                                {equipo.nombre}
                                <button 
                                  type="button" 
                                  onClick={() => setActiveTooltip(activeTooltip === equipo.id ? null : equipo.id)}
                                  className="text-white/30 hover:text-secondary transition-colors"
                                  title="¿Por qué este consumo?"
                                >
                                  <HelpCircle className="w-3.5 h-3.5" />
                                </button>
                              </h3>
                              <span className="text-[10px] font-black uppercase tracking-widest text-secondary font-mono">
                                Potencia Pico: {equipo.potencia_W} W
                              </span>
                            </div>

                            {/* Qty Counter */}
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(equipo.id, -1)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-6 text-center font-bold text-sm text-white">
                                {equipo.cantidad}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQtyChange(equipo.id, 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-colors animate-press"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Tooltip Content */}
                          {activeTooltip === equipo.id && (
                            <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-[11px] text-white/70 leading-relaxed relative animate-in slide-in-from-top-1">
                              {equipo.tooltip}
                              <button 
                                onClick={() => setActiveTooltip(null)} 
                                className="absolute top-1 right-2 text-white/40 hover:text-white font-bold"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Lower Section: Hours Sliders if selected */}
                        {equipo.cantidad > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-xs text-white/60">
                              <span>
                                {equipo.esMinutos ? "Minutos de uso diario:" : "Horas de uso diario:"}
                              </span>
                              <span className="font-bold text-white font-mono bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5">
                                {equipo.esMinutos 
                                  ? `${Math.round(equipo.horas_uso * 60)} min`
                                  : `${equipo.horas_uso} hrs`
                                }
                              </span>
                            </div>
                            
                            {equipo.uso_fijo ? (
                              <div className="text-[10px] text-secondary font-black uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> Fijo 24 horas continuas (Cálculo promedio)
                              </div>
                            ) : (
                              <input
                                type="range"
                                min={equipo.esMinutos ? "0.083" : "1"} // 5 minutos mín para cocina
                                max={equipo.max_horas || "24"}
                                step={equipo.esMinutos ? "0.083" : "1"}
                                value={equipo.horas_uso}
                                onChange={(e) => handleHorasChange(equipo.id, parseFloat(e.target.value))}
                                className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-secondary"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right Side Panel: Sticky Real-time calculations */}
            <div className="w-full lg:w-1/3 lg:sticky lg:top-8 space-y-6">
              <div className="glass-dark border border-secondary/20 shadow-[0_0_40px_rgba(255,98,0,0.04)] rounded-[2.5rem] p-6 md:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>

                <h3 className="text-lg font-black text-white border-b border-white/5 pb-4 uppercase tracking-widest flex items-center gap-2">
                  <Sun className="text-secondary w-5 h-5 animate-spin duration-[8000ms]" />
                  📊 Consumo Simulador
                </h3>

                {selectedEquipos.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="text-4xl">💡</div>
                    <p className="text-xs text-white/40 leading-relaxed uppercase tracking-wider font-bold">
                      Aún no has seleccionado equipos.<br />
                      Empieza agregando tu nevera, iluminación e internet en el panel izquierdo.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Consumo Wh, Pico */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Energía Diaria</span>
                        <div className="text-xl font-black text-white font-mono leading-none">
                          {(consumoTotal_Wh / 1000).toFixed(2)}
                          <span className="text-xs text-secondary font-sans font-bold ml-1">kWh</span>
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Carga Pico</span>
                        <div className="text-xl font-black text-white font-mono leading-none">
                          {potenciaPico_W}
                          <span className="text-xs text-secondary font-sans font-bold ml-1">W</span>
                        </div>
                      </div>
                    </div>

                    {/* Resumen Mensual */}
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-widest text-white/60">Consumo mensual:</span>
                      <span className="text-base font-black text-white font-mono">
                        {consumoMensual_kWh.toFixed(1)} kWh/mes
                      </span>
                    </div>

                    {/* Alertas dinámicas */}
                    {alertas.length > 0 && (
                      <div className="space-y-2 border-t border-white/5 pt-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Alertas del sistema:</span>
                        <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                          {alertas.map((al, idx) => (
                            <div 
                              key={idx} 
                              className={`p-3 rounded-xl text-[10px] leading-tight ${
                                al.tipo === "error" 
                                  ? "bg-red-500/10 border border-red-500/20 text-red-400" 
                                  : al.tipo === "warning"
                                  ? "bg-orange-500/10 border border-orange-500/20 text-orange-400"
                                  : "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                              }`}
                            >
                              {al.mensaje}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lista corta de lo agregado */}
                    <div className="border-t border-white/5 pt-4 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Cargas agregadas ({selectedEquipos.length}):</span>
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                        {selectedEquipos.map(eq => (
                          <div key={eq.id} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-xl border border-white/5">
                            <span className="truncate max-w-[180px] font-bold text-white">{eq.nombre}</span>
                            <span className="text-white/50 text-[10px] font-mono">
                              {eq.cantidad} ud × {eq.esMinutos ? `${Math.round(eq.horas_uso * 60)}m` : `${eq.horas_uso}h`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="border-t border-white/5 pt-6 space-y-3">
                      <button
                        type="button"
                        onClick={() => {
                          setStep(3);
                          window.scrollTo({ top: 180, behavior: "smooth" });
                        }}
                        disabled={selectedEquipos.length === 0}
                        className="w-full bg-secondary hover:bg-secondary/90 disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-xl shadow-secondary/10 hover:shadow-secondary/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                      >
                        Calcular Sistema Ideal <ArrowRight className="w-4.5 h-4.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          window.scrollTo({ top: 180, behavior: "smooth" });
                        }}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/5 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                      >
                        <ArrowLeft className="w-4 h-4" /> Volver al Paso 1
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            STEP 3: RESULTADOS E INFOGRAFÍA TÉCNICA
            ======================================================= */}
        {step === 3 && (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-300">
            {/* Infografía Principal */}
            <div className="glass-dark border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
              {/* Sun graphic backdrop */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 mb-8 gap-4">
                <div>
                  <h2 className="text-2xl md:text-4xl font-black text-white flex items-center gap-3">
                    <CheckCircle2 className="text-secondary w-8 h-8 md:w-10 md:h-10" />
                    ¡Tu Sistema Solar Recomendado está listo!
                  </h2>
                  <p className="text-white/50 text-sm mt-1">
                    Diseñado específicamente para el perfil de consumo y las condiciones de irradiación en Venezuela.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={guardarEscenario}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black px-5 py-3 rounded-2xl transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
                >
                  <RefreshCw className="w-4 h-4" /> Guardar Escenario
                </button>
              </div>

              {/* Grid 3 Columnas: Paneles, Baterías, Inversor */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Paneles */}
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] hover:border-secondary/25 transition-all duration-300 flex flex-col justify-between relative group">
                  <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                    <Sun className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Generación limpia</span>
                    <h3 className="text-2xl font-black text-white mt-2 mb-6">Módulos Solares</h3>
                    
                    <div className="space-y-4">
                      <div className="text-4xl font-black text-white font-mono tracking-tight">
                        {numPaneles} <span className="text-sm font-sans font-medium text-white/50">paneles</span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Recomendamos paneles de <strong>{panelSeleccionado.potencia_W}Wp</strong> Monocristalinos de alta eficiencia por su óptimo rendimiento ante la nubosidad y temperaturas en Venezuela.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-6 mt-8 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/50">Potencia total:</span>
                      <span className="font-bold text-white font-mono">{numPaneles * panelSeleccionado.potencia_W} Wp</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Área estimada:</span>
                      <span className="font-bold text-white font-mono">{(numPaneles * 2.2).toFixed(1)} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Garantía solar:</span>
                      <span className="font-bold text-green-400">25 Años</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Baterías */}
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] hover:border-secondary/25 transition-all duration-300 flex flex-col justify-between relative group">
                  <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                    <Battery className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Respaldo Inteligente</span>
                    <h3 className="text-2xl font-black text-white mt-2 mb-6">Baterías de Litio</h3>
                    
                    <div className="space-y-4">
                      <div className="text-4xl font-black text-white font-mono tracking-tight">
                        {numBaterias} <span className="text-sm font-sans font-medium text-white/50">unidades</span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Baterías de Litio (LiFePO4) de <strong>{bateriaSeleccionada.capacidad_Ah}Ah</strong> en banco de <strong>{voltajeBanco}V</strong>. Ofrecen un factor de descarga segura del 90% y más de 10 años de vida útil.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-6 mt-8 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/50">Capacidad Total:</span>
                      <span className="font-bold text-white font-mono">{capacidadReal_Ah} Ah</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Energía Almacenada:</span>
                      <span className="font-bold text-white font-mono">{energiaBaterias_kWh.toFixed(1)} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Autonomía promedio:</span>
                      <span className="font-bold text-white font-mono">{autonomiaHoras.toFixed(1)} horas</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Inversor */}
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] hover:border-secondary/25 transition-all duration-300 flex flex-col justify-between relative group">
                  <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Cerebro del Sistema</span>
                    <h3 className="text-2xl font-black text-white mt-2 mb-6">Inversor Híbrido</h3>
                    
                    <div className="space-y-4">
                      <div className="text-4xl font-black text-white font-mono tracking-tight">
                        {inversorSeleccionado.capacidad_kVA} <span className="text-sm font-sans font-medium text-white/50">kVA</span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Inversor híbrido de <strong>Onda Pura</strong>. Administra de forma inteligente la energía de los paneles, las baterías de litio, la red eléctrica de CORPOELEC y plantas a gasolina.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-6 mt-8 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/50">Potencia nominal:</span>
                      <span className="font-bold text-white font-mono">{inversorSeleccionado.capacidad_W} W</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Voltaje Entrada DC:</span>
                      <span className="font-bold text-white font-mono">{voltajeBanco} V</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Tipo de Onda:</span>
                      <span className="font-bold text-green-400">Pura Certificada</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RANGO DE INVERSIÓN PRINCIPAL */}
              <div className="mt-12 bg-white/5 border border-white/5 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-secondary/5 to-transparent pointer-events-none"></div>
                
                <div className="space-y-2 max-w-lg">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Inversión Estimada Llave en Mano</span>
                  <div className="text-3xl md:text-5xl font-black text-white font-mono tracking-tight leading-none">
                    ${precioMin} - ${precioMax} <span className="text-base font-sans font-bold text-white/50 ml-1">USD</span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    *El precio final puede variar según la complejidad del tendido de cables, altura/tipo del techo, soportes coplanares requeridos y adecuaciones del tablero eléctrico de tu propiedad. <strong>Incluye equipos, protecciones y mano de obra experta en El Vigía/Mérida.</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const formElem = document.getElementById("lead-form");
                      if (formElem) formElem.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="bg-secondary hover:bg-secondary/90 text-white font-black px-8 py-5 rounded-2xl shadow-xl shadow-secondary/15 hover:shadow-secondary/25 transition-all text-xs uppercase tracking-widest text-center"
                  >
                    Obtener Cotización Exacta →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(2);
                      window.scrollTo({ top: 180, behavior: "smooth" });
                    }}
                    className="bg-white/5 hover:bg-white/10 border border-white/5 text-white font-black px-6 py-5 rounded-2xl transition-all text-xs uppercase tracking-widest text-center"
                  >
                    Modificar Equipos
                  </button>
                </div>
              </div>

              {/* Beneficios e Impacto */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-white/5 text-center">
                <div className="space-y-1.5 p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="text-2xl">🔋</div>
                  <h4 className="font-bold text-xs uppercase text-white/80">Autonomía</h4>
                  <p className="text-xl font-black text-white font-mono">{autonomiaHoras.toFixed(1)} Horas</p>
                  <span className="text-[10px] text-white/40 block">Respaldo ante apagones nocturnos</span>
                </div>
                <div className="space-y-1.5 p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="text-2xl">⚡</div>
                  <h4 className="font-bold text-xs uppercase text-white/80">Ahorro Daños</h4>
                  <p className="text-xl font-black text-green-400">100%</p>
                  <span className="text-[10px] text-white/40 block">Protección contra picos de voltaje</span>
                </div>
                <div className="space-y-1.5 p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="text-2xl">💸</div>
                  <h4 className="font-bold text-xs uppercase text-white/80">Combustible</h4>
                  <p className="text-xl font-black text-white">$0 USD</p>
                  <span className="text-[10px] text-white/40 block">Sin gastos de gasolina o ruido</span>
                </div>
                <div className="space-y-1.5 p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="text-2xl">📈</div>
                  <h4 className="font-bold text-xs uppercase text-white/80">Retorno (ROI)</h4>
                  <p className="text-xl font-black text-white font-mono">~{mesesROI} Meses</p>
                  <span className="text-[10px] text-white/40 block">Valorización de tu propiedad</span>
                </div>
              </div>
            </div>

            {/* COMPARATIVE SCENARIOS PANEL (MODO COMPARACIÓN) */}
            {scenarios.length > 0 && (
              <div className="glass-dark border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <h3 className="text-xl md:text-2xl font-black text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-3">
                  <RefreshCw className="text-secondary w-6 h-6 animate-spin duration-[6000ms]" />
                  📂 Comparador de Escenarios
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Current scenario card */}
                  <div className="bg-secondary/5 border-2 border-secondary p-6 rounded-2xl relative space-y-4">
                    <span className="absolute top-4 right-4 bg-secondary text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Actual</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Escenario Actual</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">Basado en tus selecciones</p>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/40">Consumo:</span>
                        <span className="font-bold text-white font-mono">{(consumoTotal_Wh / 1000).toFixed(2)} kWh/d</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/40">Inversor:</span>
                        <span className="font-bold text-white">{inversorSeleccionado.capacidad_kVA} kVA</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/40">Paneles:</span>
                        <span className="font-bold text-white">{numPaneles} uds</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/40">Baterías:</span>
                        <span className="font-bold text-white">{numBaterias} uds</span>
                      </div>
                      <div className="flex justify-between pt-1 font-bold text-secondary">
                        <span>Rango:</span>
                        <span>${precioMin} - ${precioMax}</span>
                      </div>
                    </div>
                  </div>

                  {/* Saved scenarios loop */}
                  {scenarios.map((esc, index) => (
                    <div key={index} className="bg-white/5 border border-white/5 p-6 rounded-2xl relative space-y-4 hover:border-white/15 transition-all">
                      <button
                        onClick={() => eliminarEscenario(index)}
                        className="absolute top-4 right-4 text-white/30 hover:text-red-500 transition-colors"
                        title="Eliminar este escenario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div>
                        <h4 className="font-bold text-white text-sm">{esc.name}</h4>
                        <p className="text-[10px] text-white/40 mt-0.5">Escenario guardado</p>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-white/40">Consumo:</span>
                          <span className="font-bold text-white font-mono">{esc.consumoDiario} kWh/d</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-white/40">Inversor:</span>
                          <span className="font-bold text-white">{esc.inversor}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-white/40">Paneles:</span>
                          <span className="font-bold text-white">{esc.paneles}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-white/40">Baterías:</span>
                          <span className="font-bold text-white">{esc.baterias}</span>
                        </div>
                        <div className="flex justify-between pt-1 font-bold text-white">
                          <span>Rango:</span>
                          <span>{esc.inversion}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FORM AND CALL TO ACTION (STEP 4: LEADS FORM AND SHARE) */}
            <div id="lead-form" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Form card */}
              <div className="glass-dark border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <h3 className="text-xl md:text-2xl font-black text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-3">
                  <User className="text-secondary w-6 h-6" />
                  📲 Recibe tu Cotización Formal Exacta
                </h3>

                <form onSubmit={handleWhatsAppSend} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-white/60 block">Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input 
                        type="text" 
                        required
                        placeholder="Ej. Juan Pérez"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 hover:border-white/10 focus:border-secondary focus:bg-white/10 h-14 pl-12 pr-4 rounded-2xl text-sm text-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-white/60 block">Teléfono / WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input 
                          type="tel" 
                          required
                          placeholder="Ej. +58 414-7550091"
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 hover:border-white/10 focus:border-secondary focus:bg-white/10 h-14 pl-12 pr-4 rounded-2xl text-sm text-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-white/60 block">Ciudad / Municipio (Venezuela)</label>
                      <div className="relative">
                        <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input 
                          type="text" 
                          required
                          placeholder="Ej. El Vigía, Mérida"
                          value={leadCity}
                          onChange={(e) => setLeadCity(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 hover:border-white/10 focus:border-secondary focus:bg-white/10 h-14 pl-12 pr-4 rounded-2xl text-sm text-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-4 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={financing}
                        onChange={(e) => setFinancing(e.target.checked)}
                        className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-secondary focus:ring-0 focus:ring-offset-0 cursor-pointer accent-secondary"
                      />
                      <span className="text-xs text-white/70 group-hover:text-white transition-colors">
                        Requiero información sobre opciones de <strong>financiamiento</strong>.
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={visitRequest}
                        onChange={(e) => setVisitRequest(e.target.checked)}
                        className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-secondary focus:ring-0 focus:ring-offset-0 cursor-pointer accent-secondary"
                      />
                      <span className="text-xs text-white/70 group-hover:text-white transition-colors">
                        Solicito una <strong>visita técnica presencial GRATUITA</strong> para medir mi techo.
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-[#4CAF50] hover:bg-[#43A047] text-white font-black py-5 rounded-2xl shadow-xl shadow-green-500/10 hover:shadow-green-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                    >
                      <MessageCircle className="w-5 h-5" /> Enviar por WhatsApp ✓
                    </button>
                    <button
                      type="button"
                      onClick={descargarPDF}
                      className="bg-white/5 hover:bg-white/10 border border-white/5 text-white font-black px-6 py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                    >
                      <FileText className="w-5 h-5 text-secondary" /> PDF Propuesta
                    </button>
                  </div>
                </form>
              </div>

              {/* Informative column (Faqs) */}
              <div className="glass-dark border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden space-y-6">
                <h3 className="text-xl md:text-2xl font-black text-white border-b border-white/5 pb-4 uppercase tracking-widest">
                  Preguntas Frecuentes 💡
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white">¿Por qué es necesario un rango de inversión?</h4>
                    <p className="text-white/60 leading-relaxed">
                      El costo de los equipos es fijo, pero el trabajo en el sitio varía. La fijación mecánica de paneles en tejas requiere anclajes distintos a las planchas de concreto. Adicionalmente, la distancia del cableado fotovoltaico influye en el grosor necesario y protecciones del tablero central de tu hogar.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-white">¿La visita técnica de inspección tiene costo?</h4>
                    <p className="text-white/60 leading-relaxed">
                      No. La visita técnica presencial para verificar la inclinación, sombra y estructura del techo en <strong>El Vigía, Mérida y zonas aledañas</strong> es completamente <strong>gratis y sin compromiso</strong>.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-white">¿El sistema solar funciona si está completamente nublado?</h4>
                    <p className="text-white/60 leading-relaxed">
                      Sí. Los paneles siguen generando energía de forma difusa (alrededor de un 15-25% de su capacidad) y el banco de baterías de litio entra automáticamente para cubrir el consumo sin cortes de microsegundos en tu hogar.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-white">¿Qué garantías tienen las instalaciones?</h4>
                    <p className="text-white/60 leading-relaxed">
                      Ofrecemos 25 años de rendimiento lineal en paneles solares de silicio monocristalino, 10 años oficiales en celdas de baterías de litio y 2 años de garantía en la instalación y cableado general de mano de obra de Servicios SP.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL WINDOW FOR WATER PUMP ADVERTENCIA */}
      {showPumpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020813]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-dark border border-secondary/20 rounded-[2.5rem] p-8 max-w-lg w-full space-y-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="text-4xl text-center">💧</div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-white uppercase tracking-wider">
                Uso Manual de Bombas de Agua Solares
              </h3>
              <p className="text-xs text-white/50">
                Información técnica vital para la durabilidad de tu inversor.
              </p>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Las bombas de agua de 0.5 HP y 1.0 HP generan un **pico de arranque inductivo de hasta 4 a 6 veces** su potencia nominal. Si la bomba está conectada en modo automático con un presostato, encenderá decenas de veces al día, desgastando tu inversor híbrido y agotando la reserva de las baterías.
            </p>
            
            <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-xl text-xs text-secondary leading-relaxed">
              <strong>💡 RECOMENDACIÓN PREMIUM:</strong> Diseñamos tu sistema pensando en que la bomba de agua se active **manualmente solo cuando sea necesario** (llenado de tanques) en las horas pico de sol (10:00 AM a 2:00 PM), minimizando el impacto en las baterías de litio.
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowPumpModal(false)}
                className="w-full bg-secondary hover:bg-secondary/90 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all"
              >
                Entendido, usar de forma manual ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Membrete / Footer of Calculator */}
      <footer className="border-t border-white/5 bg-[#020813]/40 py-8 relative z-10 text-center">
        <div className="container mx-auto px-4 space-y-4">
          <div className="flex justify-center items-center gap-6 text-[10px] uppercase tracking-widest text-white/40 font-bold">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-secondary" /> Equipos Originales</span>
            <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-secondary" /> Ingeniería Garantizada</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-secondary" /> Instalación en El Vigía / Mérida</span>
          </div>
          <p className="text-[10px] text-white/30 leading-relaxed max-w-xl mx-auto">
            © 2026 Servicios y Suministros SP. RIF: J-40403649-0. Todos los derechos reservados. El cálculo matemático preliminar está basado en especificaciones óptimas físicas y de irradiación de la República Bolivariana de Venezuela.
          </p>
        </div>
      </footer>
    </div>
  )
}
