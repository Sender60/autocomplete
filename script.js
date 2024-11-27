const searchBox = document.querySelector('.search-input');
const inputBox = document.querySelector('input');
const autocomBoxList = document.querySelector('.autocom-box');
const profilesList = document.querySelector('.profiles-list');
const textError = document.querySelector('.error');
const buttonClose = document.querySelectorAll('.btn-close');

let repositories;

function debounce(func, timeout = 200) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

function clearInput() {
    inputBox.value = '';
    autocomBoxList.innerHTML = '';
}

function profileItem(repo) {
    return `<li>
        <p>Name: ${repo.name}</p>
        <p>Owner: ${repo.owner.login}</p>
        <p>Stars: ${repo.stargazers_count}</p>
        <button class="btn-close fas fa-times"></button>
    </li>`;
}

async function searchRepo() {
    const inputSearch = inputBox.value.trim();

    if (inputSearch === '') {
        clearInput();
        return;
    }

    let html = '';
    try {
        repositories = await fetchRepo(inputSearch);
        repositories.items.forEach((repo) => {
            const li = document.createElement('li');
            li.textContent = repo.name;
            html += li.outerHTML;
        });
    } catch (error) {
        return;
    }
    autocomBoxList.innerHTML = '';
    autocomBoxList.insertAdjacentHTML('beforeend', html);
}

async function fetchRepo(repo) {
    const apiRepo = await fetch(`https://api.github.com/search/repositories?q=${repo}&per_page=5`);
    if (!apiRepo.ok) {
        textError.textContent = 'Ошибка: ' + apiRepo.status;
    }
    const data = await apiRepo.json();
    return data;
}

const debounceSearch = debounce(searchRepo);
inputBox.addEventListener('keyup', debounceSearch);

buttonClose.forEach((button) => {
    button.addEventListener('click', () => {
        button.parentNode.remove();
    });
});

const deleteProfile = (e) => {
    if (e.target.classList.contains('btn-close')) {
        e.target.closest('li').remove();
    }
};

autocomBoxList.addEventListener('click', (e) => {
    const selected = e.target.closest('li');
    if (selected) {
        profilesList.insertAdjacentHTML(
            'beforeend',
            profileItem(repositories.items.find((repo) => repo.name === selected.textContent)),
        );
        clearInput();
        profilesList.addEventListener('click', deleteProfile);
    }
});
