// Vehicles data and functionality

// Sample vehicles data (replace with actual API data)
allVehicles = [
    {
        id: 1,
        brand: 'Chevrolet',
        model: 'Onix',
        year: 2023,
        price: 65000,
        mileage: 15000,
        fuel: 'Flex',
        transmission: 'Manual',
        type: 'hatchback',
        color: 'Branco',
        doors: 5,
        description: 'Chevrolet Onix 2023 em excelente estado de conservação. Veículo revisado, com baixa quilometragem e único dono. Ideal para quem busca economia e praticidade no dia a dia.'
    },
    {
        id: 2,
        brand: 'Volkswagen',
        model: 'Polo',
        year: 2022,
        price: 72000,
        mileage: 25000,
        fuel: 'Flex',
        transmission: 'Automático',
        type: 'hatchback',
        color: 'Prata',
        doors: 5,
        description: 'Volkswagen Polo 2022 com câmbio automático. Veículo muito bem conservado, com todas as revisões em dia. Perfeito para uso urbano e viagens.'
    },
    {
        id: 3,
        brand: 'Fiat',
        model: 'Argo',
        year: 2021,
        price: 58000,
        mileage: 35000,
        fuel: 'Flex',
        transmission: 'Manual',
        type: 'hatchback',
        color: 'Vermelho',
        doors: 5,
        description: 'Fiat Argo 2021 em ótimo estado. Veículo econômico e confiável, ideal para o primeiro carro. Manutenção sempre em dia.'
    },
    {
        id: 4,
        brand: 'Honda',
        model: 'Civic',
        year: 2020,
        price: 95000,
        mileage: 45000,
        fuel: 'Flex',
        transmission: 'Automático',
        type: 'sedan',
        color: 'Preto',
        doors: 4,
        description: 'Honda Civic 2020 sedan, veículo de luxo com excelente desempenho. Muito bem equipado e conservado. Ideal para executivos.'
    },
    {
        id: 5,
        brand: 'Toyota',
        model: 'Corolla',
        year: 2019,
        price: 88000,
        mileage: 55000,
        fuel: 'Flex',
        transmission: 'Automático',
        type: 'sedan',
        color: 'Branco',
        doors: 4,
        description: 'Toyota Corolla 2019, conhecido pela confiabilidade e economia. Veículo muito bem mantido, com histórico de revisões.'
    },
    {
        id: 6,
        brand: 'Ford',
        model: 'Ka',
        year: 2022,
        price: 52000,
        mileage: 18000,
        fuel: 'Flex',
        transmission: 'Manual',
        type: 'hatchback',
        color: 'Azul',
        doors: 5,
        description: 'Ford Ka 2022, compacto e econômico. Perfeito para uso urbano, baixo consumo e fácil estacionamento.'
    },
    {
        id: 7,
        brand: 'Chevrolet',
        model: 'Cruze',
        year: 2018,
        price: 78000,
        mileage: 65000,
        fuel: 'Flex',
        transmission: 'Automático',
        type: 'sedan',
        color: 'Prata',
        doors: 4,
        description: 'Chevrolet Cruze 2018 sedan, veículo espaçoso e confortável. Ideal para famílias, com bom espaço interno e porta-malas.'
    },
    {
        id: 8,
        brand: 'Volkswagen',
        model: 'T-Cross',
        year: 2021,
        price: 85000,
        mileage: 30000,
        fuel: 'Flex',
        transmission: 'Automático',
        type: 'suv',
        color: 'Cinza',
        doors: 5,
        description: 'Volkswagen T-Cross 2021 SUV, veículo moderno e versátil. Excelente para cidade e aventuras, com boa altura do solo.'
    },
    {
        id: 9,
        brand: 'Fiat',
        model: 'Toro',
        year: 2020,
        price: 92000,
        mileage: 40000,
        fuel: 'Flex',
        transmission: 'Automático',
        type: 'pickup',
        color: 'Branco',
        doors: 4,
        description: 'Fiat Toro 2020 pickup, veículo robusto e prático. Ideal para trabalho e lazer, com boa capacidade de carga.'
    },
    {
        id: 10,
        brand: 'Honda',
        model: 'HR-V',
        year: 2019,
        price: 89000,
        mileage: 50000,
        fuel: 'Flex',
        transmission: 'Automático',
        type: 'suv',
        color: 'Vermelho',
        doors: 5,
        description: 'Honda HR-V 2019 SUV compacto, muito econômico e confiável. Excelente para uso urbano e viagens.'
    },
    {
        id: 11,
        brand: 'Toyota',
        model: 'Hilux',
        year: 2018,
        price: 145000,
        mileage: 75000,
        fuel: 'Diesel',
        transmission: 'Manual',
        type: 'pickup',
        color: 'Branco',
        doors: 4,
        description: 'Toyota Hilux 2018 diesel, pickup robusta e confiável. Ideal para trabalho pesado e aventuras off-road.'
    },
    {
        id: 12,
        brand: 'Ford',
        model: 'EcoSport',
        year: 2017,
        price: 68000,
        mileage: 80000,
        fuel: 'Flex',
        transmission: 'Manual',
        type: 'suv',
        color: 'Azul',
        doors: 5,
        description: 'Ford EcoSport 2017 SUV, veículo popular e econômico. Bom custo-benefício para quem busca um SUV acessível.'
    },
    {
        id: 13,
        brand: 'Chevrolet',
        model: 'Tracker',
        year: 2021,
        price: 98000,
        mileage: 22000,
        fuel: 'Flex',
        transmission: 'Automático',
        type: 'suv',
        color: 'Preto',
        doors: 5,
        description: 'Chevrolet Tracker 2021 SUV, moderno e tecnológico. Excelente conjunto de equipamentos e conforto.'
    },
    {
        id: 14,
        brand: 'Volkswagen',
        model: 'Virtus',
        year: 2020,
        price: 75000,
        mileage: 35000,
        fuel: 'Flex',
        transmission: 'Automático',
        type: 'sedan',
        color: 'Prata',
        doors: 4,
        description: 'Volkswagen Virtus 2020 sedan, veículo elegante e econômico. Boa opção para quem busca conforto e praticidade.'
    },
    {
        id: 15,
        brand: 'Fiat',
        model: 'Strada',
        year: 2022,
        price: 82000,
        mileage: 12000,
        fuel: 'Flex',
        transmission: 'Manual',
        type: 'pickup',
        color: 'Branco',
        doors: 2,
        description: 'Fiat Strada 2022 pickup, veículo novo e prático. Ideal para trabalho e uso pessoal, com baixa quilometragem.'
    }
];

// Vehicle filter and search functionality
function filterVehiclesByBrand(brand) {
    return allVehicles.filter(vehicle => 
        vehicle.brand.toLowerCase().includes(brand.toLowerCase())
    );
}

function filterVehiclesByType(type) {
    return allVehicles.filter(vehicle => 
        vehicle.type.toLowerCase() === type.toLowerCase()
    );
}

function filterVehiclesByPriceRange(minPrice, maxPrice) {
    return allVehicles.filter(vehicle => 
        vehicle.price >= minPrice && vehicle.price <= maxPrice
    );
}

function filterVehiclesByYear(minYear) {
    return allVehicles.filter(vehicle => 
        vehicle.year >= minYear
    );
}

function searchVehicles(searchTerm) {
    const term = searchTerm.toLowerCase();
    return allVehicles.filter(vehicle => 
        vehicle.brand.toLowerCase().includes(term) ||
        vehicle.model.toLowerCase().includes(term) ||
        vehicle.color.toLowerCase().includes(term) ||
        vehicle.fuel.toLowerCase().includes(term)
    );
}

// Get vehicle by ID
function getVehicleById(id) {
    return allVehicles.find(vehicle => vehicle.id === parseInt(id));
}

// Get featured vehicles (first 3)
function getFeaturedVehicles() {
    return allVehicles.slice(0, 3);
}

// Get vehicles by category
function getVehiclesByCategory(category) {
    switch(category) {
        case 'economicos':
            return allVehicles.filter(vehicle => vehicle.price < 60000);
        case 'luxo':
            return allVehicles.filter(vehicle => vehicle.price > 100000);
        case 'novos':
            return allVehicles.filter(vehicle => vehicle.year >= 2022);
        case 'seminovos':
            return allVehicles.filter(vehicle => vehicle.year >= 2018 && vehicle.year < 2022);
        default:
            return allVehicles;
    }
}

// Sort vehicles
function sortVehicles(vehicles, sortBy) {
    const sortedVehicles = [...vehicles];
    
    switch(sortBy) {
        case 'price-low':
            return sortedVehicles.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sortedVehicles.sort((a, b) => b.price - a.price);
        case 'year-new':
            return sortedVehicles.sort((a, b) => b.year - a.year);
        case 'year-old':
            return sortedVehicles.sort((a, b) => a.year - b.year);
        case 'mileage-low':
            return sortedVehicles.sort((a, b) => a.mileage - b.mileage);
        case 'mileage-high':
            return sortedVehicles.sort((a, b) => b.mileage - a.mileage);
        case 'brand':
            return sortedVehicles.sort((a, b) => a.brand.localeCompare(b.brand));
        default:
            return sortedVehicles;
    }
}

// Get vehicle statistics
function getVehicleStats() {
    const stats = {
        total: allVehicles.length,
        brands: [...new Set(allVehicles.map(v => v.brand))].length,
        averagePrice: Math.round(allVehicles.reduce((sum, v) => sum + v.price, 0) / allVehicles.length),
        averageYear: Math.round(allVehicles.reduce((sum, v) => sum + v.year, 0) / allVehicles.length),
        averageMileage: Math.round(allVehicles.reduce((sum, v) => sum + v.mileage, 0) / allVehicles.length),
        byType: {},
        byBrand: {},
        byYear: {}
    };
    
    // Count by type
    allVehicles.forEach(vehicle => {
        stats.byType[vehicle.type] = (stats.byType[vehicle.type] || 0) + 1;
    });
    
    // Count by brand
    allVehicles.forEach(vehicle => {
        stats.byBrand[vehicle.brand] = (stats.byBrand[vehicle.brand] || 0) + 1;
    });
    
    // Count by year
    allVehicles.forEach(vehicle => {
        stats.byYear[vehicle.year] = (stats.byYear[vehicle.year] || 0) + 1;
    });
    
    return stats;
}

// Get price ranges
function getPriceRanges() {
    return [
        { label: 'Até R$ 50.000', min: 0, max: 50000 },
        { label: 'R$ 50.001 - R$ 70.000', min: 50001, max: 70000 },
        { label: 'R$ 70.001 - R$ 90.000', min: 70001, max: 90000 },
        { label: 'R$ 90.001 - R$ 120.000', min: 90001, max: 120000 },
        { label: 'Acima de R$ 120.000', min: 120001, max: Infinity }
    ];
}

// Get available brands
function getAvailableBrands() {
    return [...new Set(allVehicles.map(v => v.brand))].sort();
}

// Get available types
function getAvailableTypes() {
    return [...new Set(allVehicles.map(v => v.type))].sort();
}

// Get available years
function getAvailableYears() {
    return [...new Set(allVehicles.map(v => v.year))].sort((a, b) => b - a);
}

// Format price for display
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

// Format mileage for display
function formatMileage(mileage) {
    return new Intl.NumberFormat('pt-BR').format(mileage) + ' km';
}

// Get vehicle condition based on year and mileage
function getVehicleCondition(vehicle) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - vehicle.year;
    const mileagePerYear = vehicle.mileage / age;
    
    if (age <= 1 && vehicle.mileage < 20000) {
        return 'Seminovo';
    } else if (age <= 3 && mileagePerYear < 20000) {
        return 'Muito bom';
    } else if (age <= 5 && mileagePerYear < 25000) {
        return 'Bom';
    } else {
        return 'Usado';
    }
}

// Calculate financing simulation
function calculateFinancing(price, downPayment, months, interestRate = 0.89) {
    const principal = price - downPayment;
    const monthlyRate = interestRate / 100;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    
    return {
        monthlyPayment: Math.round(monthlyPayment),
        totalAmount: Math.round(monthlyPayment * months + downPayment),
        totalInterest: Math.round(monthlyPayment * months + downPayment - price)
    };
}

// Get similar vehicles
function getSimilarVehicles(vehicle, limit = 3) {
    return allVehicles
        .filter(v => v.id !== vehicle.id)
        .filter(v => v.brand === vehicle.brand || v.type === vehicle.type)
        .filter(v => Math.abs(v.price - vehicle.price) < 30000)
        .sort((a, b) => Math.abs(a.price - vehicle.price) - Math.abs(b.price - vehicle.price))
        .slice(0, limit);
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        allVehicles,
        filterVehiclesByBrand,
        filterVehiclesByType,
        filterVehiclesByPriceRange,
        filterVehiclesByYear,
        searchVehicles,
        getVehicleById,
        getFeaturedVehicles,
        getVehiclesByCategory,
        sortVehicles,
        getVehicleStats,
        getPriceRanges,
        getAvailableBrands,
        getAvailableTypes,
        getAvailableYears,
        formatPrice,
        formatMileage,
        getVehicleCondition,
        calculateFinancing,
        getSimilarVehicles
    };
}
