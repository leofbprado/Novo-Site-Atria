// Main JavaScript file for AutoMax website

// Global variables
let currentPage = 1;
let totalPages = 1;
let filteredVehicles = [];
let allVehicles = [];

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile navigation
    initMobileNav();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize contact form
    initContactForm();
    
    // Initialize smooth scrolling
    initSmoothScroll();
    
    // Load featured vehicles on homepage
    if (document.getElementById('featured-vehicles')) {
        loadFeaturedVehicles();
    }
    
    // Initialize vehicle detail page
    if (document.getElementById('vehicle-content')) {
        loadVehicleDetail();
    }
    
    // Initialize filters and sorting on vehicles page
    if (document.getElementById('vehicles-grid')) {
        initVehiclesPage();
    }
});

// Mobile Navigation
function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements that should fade in
    const elementsToObserve = document.querySelectorAll('.feature-card, .vehicle-card, .value-card, .team-member, .timeline-item');
    elementsToObserve.forEach(element => {
        element.classList.add('fade-in');
        observer.observe(element);
    });
}

// Contact Form
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Validate form
            if (validateContactForm(data)) {
                submitContactForm(data);
            }
        });
    }
}

// Validate Contact Form
function validateContactForm(data) {
    let isValid = true;
    const errors = [];
    
    // Required fields validation
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
        isValid = false;
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Email inválido');
        isValid = false;
    }
    
    if (!data.subject) {
        errors.push('Por favor, selecione um assunto');
        isValid = false;
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Mensagem deve ter pelo menos 10 caracteres');
        isValid = false;
    }
    
    // Display errors
    if (!isValid) {
        showAlert('Por favor, corrija os seguintes erros:\n' + errors.join('\n'), 'error');
    }
    
    return isValid;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Submit Contact Form
function submitContactForm(data) {
    // Show loading state
    const submitBtn = document.querySelector('#contact-form button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        // Reset form
        document.getElementById('contact-form').reset();
        
        // Show success message
        showAlert('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Show Alert
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Insert alert before form
    const form = document.getElementById('contact-form');
    if (form) {
        form.parentNode.insertBefore(alert, form);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// Smooth Scrolling
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed header
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Load Featured Vehicles
function loadFeaturedVehicles() {
    const featuredContainer = document.getElementById('featured-vehicles');
    
    if (featuredContainer) {
        // Show loading state
        featuredContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        
        // Simulate API call
        setTimeout(() => {
            const featuredVehicles = allVehicles.slice(0, 3);
            displayVehicles(featuredVehicles, featuredContainer);
        }, 1000);
    }
}

// Load Vehicle Detail
function loadVehicleDetail() {
    const vehicleContent = document.getElementById('vehicle-content');
    
    if (vehicleContent) {
        // Get vehicle ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const vehicleId = urlParams.get('id');
        
        if (vehicleId) {
            // Show loading state
            vehicleContent.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
            
            // Simulate API call
            setTimeout(() => {
                const vehicle = allVehicles.find(v => v.id === parseInt(vehicleId));
                if (vehicle) {
                    displayVehicleDetail(vehicle);
                } else {
                    vehicleContent.innerHTML = '<p>Veículo não encontrado.</p>';
                }
            }, 1000);
        } else {
            vehicleContent.innerHTML = '<p>ID do veículo não fornecido.</p>';
        }
    }
}

// Display Vehicle Detail
function displayVehicleDetail(vehicle) {
    const vehicleContent = document.getElementById('vehicle-content');
    
    const detailHTML = `
        <div class="vehicle-detail-content">
            <div class="vehicle-gallery">
                <i class="fas fa-car"></i>
            </div>
            <div class="vehicle-details">
                <h1>${vehicle.brand} ${vehicle.model}</h1>
                <div class="vehicle-price-large">R$ ${vehicle.price.toLocaleString('pt-BR')}</div>
                <ul class="vehicle-specs-list">
                    <li>
                        <span class="spec-label">Ano:</span>
                        <span class="spec-value">${vehicle.year}</span>
                    </li>
                    <li>
                        <span class="spec-label">Quilometragem:</span>
                        <span class="spec-value">${vehicle.mileage.toLocaleString('pt-BR')} km</span>
                    </li>
                    <li>
                        <span class="spec-label">Combustível:</span>
                        <span class="spec-value">${vehicle.fuel}</span>
                    </li>
                    <li>
                        <span class="spec-label">Câmbio:</span>
                        <span class="spec-value">${vehicle.transmission}</span>
                    </li>
                    <li>
                        <span class="spec-label">Cor:</span>
                        <span class="spec-value">${vehicle.color}</span>
                    </li>
                    <li>
                        <span class="spec-label">Portas:</span>
                        <span class="spec-value">${vehicle.doors}</span>
                    </li>
                </ul>
                <div class="vehicle-actions-large">
                    <a href="contact.html" class="btn btn-primary">Tenho Interesse</a>
                    <a href="tel:+5511999999999" class="btn btn-outline">Ligar Agora</a>
                    <a href="https://wa.me/5511999999999" class="btn btn-outline">WhatsApp</a>
                </div>
            </div>
            <div class="vehicle-description">
                <h3>Descrição</h3>
                <p>${vehicle.description}</p>
            </div>
        </div>
    `;
    
    vehicleContent.innerHTML = detailHTML;
}

// Initialize Vehicles Page
function initVehiclesPage() {
    // Load all vehicles
    loadAllVehicles();
    
    // Initialize filters
    initFilters();
    
    // Initialize sorting
    initSorting();
}

// Load All Vehicles
function loadAllVehicles() {
    const vehiclesGrid = document.getElementById('vehicles-grid');
    
    if (vehiclesGrid) {
        // Show loading state
        vehiclesGrid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        
        // Simulate API call
        setTimeout(() => {
            filteredVehicles = [...allVehicles];
            displayVehiclesPage();
        }, 1000);
    }
}

// Initialize Filters
function initFilters() {
    const filters = ['brand-filter', 'type-filter', 'price-filter', 'year-filter'];
    
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', applyFilters);
        }
    });
}

// Initialize Sorting
function initSorting() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', applySorting);
    }
}

// Apply Filters
function applyFilters() {
    const brandFilter = document.getElementById('brand-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    
    filteredVehicles = allVehicles.filter(vehicle => {
        return (!brandFilter || vehicle.brand.toLowerCase() === brandFilter) &&
               (!typeFilter || vehicle.type.toLowerCase() === typeFilter) &&
               (!priceFilter || vehicle.price <= parseInt(priceFilter)) &&
               (!yearFilter || vehicle.year >= parseInt(yearFilter));
    });
    
    currentPage = 1;
    displayVehiclesPage();
}

// Apply Sorting
function applySorting() {
    const sortValue = document.getElementById('sort-select').value;
    
    filteredVehicles.sort((a, b) => {
        switch (sortValue) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'year-new':
                return b.year - a.year;
            case 'year-old':
                return a.year - b.year;
            case 'newest':
            default:
                return b.id - a.id;
        }
    });
    
    displayVehiclesPage();
}

// Clear Filters
function clearFilters() {
    document.getElementById('brand-filter').value = '';
    document.getElementById('type-filter').value = '';
    document.getElementById('price-filter').value = '';
    document.getElementById('year-filter').value = '';
    
    filteredVehicles = [...allVehicles];
    currentPage = 1;
    displayVehiclesPage();
}

// Display Vehicles Page
function displayVehiclesPage() {
    const vehiclesGrid = document.getElementById('vehicles-grid');
    const resultsCount = document.getElementById('results-count');
    const vehiclesPerPage = 9;
    
    // Calculate pagination
    totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);
    const startIndex = (currentPage - 1) * vehiclesPerPage;
    const endIndex = startIndex + vehiclesPerPage;
    const currentVehicles = filteredVehicles.slice(startIndex, endIndex);
    
    // Update results count
    if (resultsCount) {
        resultsCount.textContent = `${filteredVehicles.length} veículo(s) encontrado(s)`;
    }
    
    // Display vehicles
    displayVehicles(currentVehicles, vehiclesGrid);
    
    // Update pagination
    updatePagination();
}

// Display Vehicles
function displayVehicles(vehicles, container) {
    if (vehicles.length === 0) {
        container.innerHTML = '<p class="text-center">Nenhum veículo encontrado.</p>';
        return;
    }
    
    const vehiclesHTML = vehicles.map(vehicle => `
        <div class="vehicle-card">
            <div class="vehicle-image">
                <i class="fas fa-car"></i>
            </div>
            <div class="vehicle-info">
                <h3 class="vehicle-title">${vehicle.brand} ${vehicle.model}</h3>
                <div class="vehicle-specs">
                    <span><i class="fas fa-calendar"></i> ${vehicle.year}</span>
                    <span><i class="fas fa-tachometer-alt"></i> ${vehicle.mileage.toLocaleString('pt-BR')} km</span>
                    <span><i class="fas fa-gas-pump"></i> ${vehicle.fuel}</span>
                </div>
                <div class="vehicle-price">R$ ${vehicle.price.toLocaleString('pt-BR')}</div>
                <div class="vehicle-actions">
                    <a href="vehicle-detail.html?id=${vehicle.id}" class="btn btn-primary btn-sm">Ver Detalhes</a>
                    <a href="contact.html" class="btn btn-outline btn-sm">Contato</a>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = vehiclesHTML;
}

// Update Pagination
function updatePagination() {
    const paginationContainer = document.getElementById('pagination');
    
    if (!paginationContainer || totalPages <= 1) {
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="active">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

// Change Page
function changePage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayVehiclesPage();
        
        // Scroll to top of vehicles section
        const vehiclesSection = document.querySelector('.vehicles-section');
        if (vehiclesSection) {
            vehiclesSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Window Load Event
window.addEventListener('load', function() {
    // Hide loading states
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(element => {
        element.style.display = 'none';
    });
});

// Window Resize Event
window.addEventListener('resize', function() {
    // Close mobile menu on resize
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Scroll Event for Header
let lastScrollTop = 0;
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop) {
        // Scrolling down
        header.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
});
