const apiUrl = 'https://dragonball-api.com/api/characters';
const charactersContainer = document.getElementById('characters-container');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalDescription = document.getElementById('modalDescription');
const modaldescriptionplanet = document.getElementById('planetdescription');
const carouselInner = document.getElementById('carouselInner');
const expandedControls = document.getElementById('expandedControls');
const playAudioButton = document.getElementById('playAudioButton');
const audioElement = document.getElementById('audiotransformacion');
let page = 1;
let loading = false;

const previousButton = document.getElementById('previous');
const nextButton = document.getElementById('next');
const paginationContainer = document.getElementById('pagination');

let paginaActual = 1;
const limit = 4;
let totalPages = 1;
let links = {};

function Obtenerpersonajes(url = `${apiUrl}?limit=${limit}`) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            charactersContainer.innerHTML = '';
            totalPages = data.meta.totalPages;
            paginaActual = data.meta.currentPage;
            links = data.links;

            data.items.forEach(character => crearpersonajecard(character));
            updatePagination();
        })
        .catch(error => console.error('Error al obtener personajes:', error));
}


function updatePagination() {
    paginationContainer.innerHTML = '';

    previousButton.disabled = !links.previous;
    nextButton.disabled = !links.next;

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('btn', 'btn-outline-warning', 'mx-1');

        if (i === paginaActual) {
            pageButton.classList.add('active');
        }

        pageButton.addEventListener('click', () => {
            Obtenerpersonajes(`${apiUrl}?limit=${limit}&page=${i}`);
        });

        paginationContainer.appendChild(pageButton);
    }
}

previousButton.addEventListener('click', () => {
    if (links.previous) Obtenerpersonajes(links.previous);
});

nextButton.addEventListener('click', () => {
    if (links.next) Obtenerpersonajes(links.next);
});


function crearpersonajecard(character) {
    const col = document.createElement('div');
    col.classList.add('col-md-3');

    const card = document.createElement('div');
    card.classList.add('card', 'h-100', 'text-center', 'shadow-sm', 'character-card');

    const img = document.createElement('img');
    img.src = character.image;
    img.classList.add('card-img-top');
    img.alt = character.name;
    img.onclick = () => obtenermodal(character.id);

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'position-relative');

    const name = document.createElement('h5');
    name.textContent = character.name;

    const infoBox = document.createElement('div');
    infoBox.classList.add('info-box', 'position-absolute', 'bg-dark', 'text-white', 'p-2', 'rounded');
    infoBox.style.display = 'none';

    const ki = document.createElement('p');
    ki.textContent = `Ki: ${character.ki}`;
    const race = document.createElement('p');
    race.textContent = `Raza: ${character.race}`;

    infoBox.appendChild(ki);
    infoBox.appendChild(race);

    cardBody.appendChild(name);
    cardBody.appendChild(infoBox);

    card.appendChild(img);
    card.appendChild(cardBody);
    col.appendChild(card);
    charactersContainer.appendChild(col);

    card.addEventListener('mouseenter', () => {
        infoBox.style.display = 'block';
    });

    card.addEventListener('mouseleave', () => {
        infoBox.style.display = 'none';
    });
}


function obtenermodal(id) {
    fetch(`${apiUrl}/${id}`)
        .then(response => response.json())
        .then(character => mostrarmodal(character))
        .catch(error => console.error('Error al obtener el personaje:', error.message));
}

function mostrarmodal(character) {
    modalTitle.textContent = character.name;
    modalImage.src = character.image;
    modalDescription.textContent = character.description;

    carouselInner.innerHTML = '';


    const planetname = document.getElementById('planetname');
    const planetimage = document.getElementById('planetimage');

    if (character.originPlanet) {
        planetname.textContent = ` Planeta de origen: ${character.originPlanet.name}`;
        planetimage.src = character.originPlanet.image;
        planetimage.style.display = 'block';
        modaldescriptionplanet.textContent = `${character.originPlanet.description}`
    } else {
    planetname.textContent = `Planeta de origen: Desconocido`;
    planetimage.style.display = 'none';
}

const carouselContainer = document.getElementById('transformationsCarousel');
const transformationsTitle = document.querySelector('.modal-body h5.mt-3');

if (character.transformations && character.transformations.length > 0) {
    carouselContainer.style.display = 'block';
    transformationsTitle.style.display = 'block';

    character.transformations.forEach((transformation, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (index === 0) carouselItem.classList.add('active');

        const link = document.createElement('a');
        link.href = '#';
        link.onclick = (e) => {
            e.preventDefault();
            expandircarousel();
        };

        const img = document.createElement('img');
        img.src = transformation.image;
        img.classList.add('d-block', 'w-100');
        img.alt = transformation.name;

        const caption = document.createElement('div');
        caption.classList.add('carousel-caption', 'd-block');
        const captionText = document.createElement('h5');
        captionText.textContent = transformation.name;

        caption.appendChild(captionText);
        link.appendChild(img);
        carouselItem.appendChild(link);
        carouselItem.appendChild(caption);
        carouselInner.appendChild(carouselItem);
    });
} else {
    carouselContainer.style.display = 'none';
    transformationsTitle.style.display = 'none';
}

const modal = new bootstrap.Modal(document.getElementById('characterModal'));
modal.show();
}

function expandircarousel() {
    const carousel = document.getElementById('transformationsCarousel');
    if (carousel.classList.contains('expanded-carousel')) {
        cerrarcarouselexpandido();
        return;
    }
    carousel.classList.add('expanded-carousel');
    expandedControls.style.display = 'block'; // Mostrar el botón de audio

    playAudioButton.onclick = () => {
        if (audioElement.paused) {
            audioElement.play();
            playAudioButton.textContent = 'Pausar Audio';
        } else {
            audioElement.pause();
            playAudioButton.textContent = 'Reproducir Audio';
        }
    };

    document.addEventListener('click', cerrarOnOutsideClick);
}

function cerrarOnOutsideClick(event) {
    const carousel = document.getElementById('transformationsCarousel');
    if (!carousel.contains(event.target)) {
        cerrarcarouselexpandido();
    }
}

function cerrarcarouselexpandido() {
    const carousel = document.getElementById('transformationsCarousel');
    carousel.classList.remove('expanded-carousel');
    expandedControls.style.display = 'none';
    audioElement.pause();
    audioElement.currentTime = 0;
    playAudioButton.textContent = 'Reproducir Audio';
    document.removeEventListener('click', cerrarOnOutsideClick);
}


Obtenerpersonajes();