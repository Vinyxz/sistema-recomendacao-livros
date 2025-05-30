document.addEventListener('DOMContentLoaded', () => {
    const backendUrl = 'http://localhost:8000/api'; // prefixo /api incluído

    // Elementos do DOM
    const authSection = document.getElementById('auth-section');
    const recommendationsSection = document.getElementById('recommendations-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginErrorMessage = document.getElementById('login-error-message');
    const registerErrorMessage = document.getElementById('register-error-message');
    const logoutButton = document.getElementById('logout-button');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const booksContainer = document.getElementById('books-container');
    const noBooksMessage = document.getElementById('no-books-message');

    const setAuthDisplay = (showLogin) => {
        const loginDiv = loginForm.closest('.auth-form');
        const registerDiv = registerForm.closest('.auth-form');
        if (showLogin) {
            loginDiv.style.display = 'block';
            registerDiv.style.display = 'none';
        } else {
            loginDiv.style.display = 'none';
            registerDiv.style.display = 'block';
        }
        loginErrorMessage.textContent = '';
        registerErrorMessage.textContent = '';
    };

    const isAuthenticated = () => localStorage.getItem('accessToken') !== null;

    const showContentBasedOnAuth = () => {
        if (isAuthenticated()) {
            authSection.style.display = 'none';
            recommendationsSection.style.display = 'block';
            logoutButton.style.display = 'inline-block';
            fetchRecommendations();
        } else {
            authSection.style.display = 'block';
            recommendationsSection.style.display = 'none';
            logoutButton.style.display = 'none';
            setAuthDisplay(true);
        }
    };

    const clearBooksContainer = () => {
        booksContainer.innerHTML = '';
        noBooksMessage.style.display = 'none';
    };

    const displayBooks = (books) => {
        clearBooksContainer();
        if (!books.length) {
            noBooksMessage.style.display = 'block';
            return;
        }
        books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.classList.add('book-card');

            const img = document.createElement('img');
            img.src = book.image_url || 'https://via.placeholder.com/150x200?text=Sem+Capa';
            img.alt = book.title;

            const title = document.createElement('h3');
            title.textContent = book.title;

            const authors = document.createElement('p');
            authors.textContent = `Autores: ${book.authors}`;

            const description = document.createElement('p');
            description.textContent = book.description;

            bookCard.append(img, title, authors, description);
            booksContainer.appendChild(bookCard);
        });
    };

    const fetchRecommendations = async (query = 'fiction') => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showContentBasedOnAuth();
            return;
        }
        try {
            const response = await fetch(`${backendUrl}/recommendations?query=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    alert('Sessão expirada. Faça login novamente.');
                    localStorage.removeItem('accessToken');
                    showContentBasedOnAuth();
                    return;
                }
                throw new Error('Erro ao buscar recomendações');
            }
            const books = await response.json();
            displayBooks(books);
        } catch (error) {
            console.error(error);
            alert('Não foi possível carregar as recomendações. Tente novamente mais tarde.');
            clearBooksContainer();
        }
    };

    const handleSearchBooks = async () => {
        const query = searchInput.value.trim();
        if (!query) {
            alert('Por favor, digite algo para pesquisar.');
            return;
        }
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showContentBasedOnAuth();
            return;
        }
        try {
            const response = await fetch(`${backendUrl}/search-books?query=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    alert('Sessão expirada. Faça login novamente.');
                    localStorage.removeItem('accessToken');
                    showContentBasedOnAuth();
                    return;
                }
                throw new Error('Erro ao buscar livros');
            }
            const books = await response.json();
            displayBooks(books);
        } catch (error) {
            console.error(error);
            alert('Não foi possível realizar a busca. Tente novamente mais tarde.');
            clearBooksContainer();
        }
    };

    showRegisterLink.addEventListener('click', e => {
        e.preventDefault();
        setAuthDisplay(false);
    });

    showLoginLink.addEventListener('click', e => {
        e.preventDefault();
        setAuthDisplay(true);
    });

    loginForm.addEventListener('submit', async e => {
        e.preventDefault();
        const username = e.target.elements['login-username'].value;
        const password = e.target.elements['login-password'].value;
        if (!username || !password) {
            loginErrorMessage.textContent = 'Por favor, preencha todos os campos.';
            return;
        }
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        try {
            const response = await fetch(`${backendUrl}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            if (!response.ok) {
                const errorData = await response.json();
                loginErrorMessage.textContent = errorData.detail || 'Erro de login.';
                return;
            }
            const data = await response.json();
            localStorage.setItem('accessToken', data.access_token);
            showContentBasedOnAuth();
        } catch (error) {
            console.error(error);
            loginErrorMessage.textContent = 'Erro de conexão. Tente novamente.';
        }
    });

    registerForm.addEventListener('submit', async e => {
        e.preventDefault();
        const username = e.target.elements['register-username'].value;
        const password = e.target.elements['register-password'].value;
        if (!username || !password) {
            registerErrorMessage.textContent = 'Por favor, preencha todos os campos.';
            return;
        }
        try {
            const response = await fetch(`${backendUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                const errorData = await response.json();
                registerErrorMessage.textContent = errorData.detail || 'Erro ao cadastrar.';
                return;
            }
            const data = await response.json();
            localStorage.setItem('accessToken', data.access_token);
            showContentBasedOnAuth();
        } catch (error) {
            console.error(error);
            registerErrorMessage.textContent = 'Erro de conexão. Tente novamente.';
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('accessToken');
        showContentBasedOnAuth();
        clearBooksContainer();
        searchInput.value = '';
    });

    searchButton.addEventListener('click', handleSearchBooks);

    searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            handleSearchBooks();
        }
    });

    showContentBasedOnAuth();
});
