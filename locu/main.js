document.addEventListener('DOMContentLoaded', () => {
  const projectsGrid = document.getElementById('projects-grid');

  // 1. Cargar proyectos dinámicamente desde el JSON
  fetch('proyectos.json')
    .then(response => response.json())
    .then(proyectos => {
      projectsGrid.innerHTML = ''; // Limpiar contenedor
      
      proyectos.forEach(proj => {
        const card = document.createElement('a');
        card.href = proj.link;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'project-card';
        
        // Estructura interna usando Literales de Plantilla HTML5
        card.innerHTML = `
          <div class="project-icon" aria-hidden="true">${proj.icon}</div>
          <h3>${proj.titulo}</h3>
          <p>${proj.descripcion}</p>
          <div class="tags">
            ${proj.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <div class="glow-effect"></div>
        `;
        
        projectsGrid.appendChild(card);
      });

      // Inicializar el efecto de brillo interactivo en las tarjetas nuevas
      initSpotlightEffect();
    })
    .catch(error => console.error('Error cargando los proyectos:', error));

  // 2. Efecto Spotlight (Luz interactiva que sigue al cursor)
  function initSpotlightEffect() {
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        // Calcular coordenadas locales del cursor dentro de la tarjeta
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Pasar las coordenadas como variables CSS dinámicas
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }
});