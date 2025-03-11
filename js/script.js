const apiUrl = 'https://dragonball-api.com/api/characters';
const charactersContainer = document.getElementById('characters-container');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalDescription = document.getElementById('modalDescription');
const carouselInner = document.getElementById('carouselInner');
const expandedControls = document.getElementById('expandedControls');
const playAudioButton = document.getElementById('playAudioButton');
const audioElement = document.getElementById('audiotransformacion');
let page = 1;
let loading = false;

let currentPage = 1;
const limit = 5;
let totalPages = 1;


document.getElementById('previous').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchCharacters();
    }
});

document.getElementById('next').addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchCharacters();
    }
});


function fetchCharacters() {
    fetch(`${apiUrl}?limit=${limit}&page=${currentPage}`)
        .then(response => response.json())
        .then(data => {
            charactersContainer.innerHTML = ''; 
            totalPages = data.meta.totalPages;
            data.items.forEach(character => createCharacterCard(character));
            updatePagination();
        })
        .catch(error => console.error('Error al obtener personajes:', error));
}
function updatePagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('btn', 'btn-outline-warning', 'mx-1');

        if (i === currentPage) {
            pageButton.classList.add('active');
        }

        pageButton.addEventListener('click', () => {
            currentPage = i;
            fetchCharacters();
        });

        paginationContainer.appendChild(pageButton);
    }
}

function createCharacterCard(character) {
    const col = document.createElement('div');
    col.classList.add('col-md-3');

    const card = document.createElement('div');
    card.classList.add('card', 'h-100', 'text-center', 'shadow-sm', 'character-card');

    const img = document.createElement('img');
    img.src = character.image;
    img.classList.add('card-img-top');
    img.alt = character.name;
    img.onclick = () => fetchCharacterDetails(character.id);

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


function fetchCharacterDetails(id) {
    fetch(`${apiUrl}/${id}`)
        .then(response => response.json())
        .then(character => showCharacterDetails(character))
        .catch(error => console.error('Error al obtener el personaje:', error.message));
}

function showCharacterDetails(character) {
    modalTitle.textContent = character.name;
    modalImage.src = character.image;
    modalDescription.textContent = character.description;
    carouselInner.innerHTML = '';

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
                expandCarousel();
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

function expandCarousel() {
    const carousel = document.getElementById('transformationsCarousel');
    if (carousel.classList.contains('expanded-carousel')) {
        closeExpandedCarousel();
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

    document.addEventListener('click', closeOnOutsideClick);
}

function closeOnOutsideClick(event) {
    const carousel = document.getElementById('transformationsCarousel');
    if (!carousel.contains(event.target)) {
        closeExpandedCarousel();
    }
}

function closeExpandedCarousel() {
    const carousel = document.getElementById('transformationsCarousel');
    carousel.classList.remove('expanded-carousel');
    expandedControls.style.display = 'none'; // Ocultar el botón de audio
    audioElement.pause();
    audioElement.currentTime = 0;
    playAudioButton.textContent = 'Reproducir Audio';
    document.removeEventListener('click', closeOnOutsideClick);
}


fetchCharacters();