document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const libraryView = document.getElementById('library-view');
    const searchView = document.getElementById('search-view');
    const backToLibraryBtn = document.getElementById('back-to-library-btn');
    const searchResultsContainer = document.getElementById('search-results');
    const libraryList = document.getElementById('library-list');
    const recommendationsGrid = document.getElementById('recommendations-grid');
    const recommendationsLoader = document.getElementById('recommendations-loader');
    const loader = document.getElementById('loader');
    const searchPlaceholder = document.getElementById('search-placeholder');
    const libraryPlaceholder = document.getElementById('library-placeholder');
    const modal = document.getElementById('details-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const notificationContainer = document.getElementById('notification-container');
    
    // Account modal elements
    const accountBtn = document.getElementById('account-btn');
    const accountModal = document.getElementById('account-modal');
    const closeAccountModalBtn = document.getElementById('close-account-modal-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const showSignupBtn = document.getElementById('show-signup-btn');
    const showLoginBtn = document.getElementById('show-login-btn');
    const showForgotPasswordBtn = document.getElementById('show-forgot-password-btn');
    const backToLoginBtn = document.getElementById('back-to-login-btn');
    const loginFormElement = document.getElementById('login-form-element');
    const signupFormElement = document.getElementById('signup-form-element');
    const forgotPasswordFormElement = document.getElementById('forgot-password-form-element');

    // --- API CONFIG ---
    const ANILIST_API_URL = 'https://graphql.anilist.co';

    // --- APP STATE ---
    let library = [];

    // --- HELPER FUNCTIONS ---
    const showNotification = (message, isError = false) => {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = `notification p-4 rounded-lg shadow-lg text-white ${isError ? 'bg-red-600' : 'bg-indigo-600'}`;
        notificationContainer.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10); // Animate in
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500); // Remove after fade out
        }, 3000);
    };
    
    const formatStatus = (status) => {
        if (!status) return 'Unknown';
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    const getStatusIcon = (status) => {
        const icons = {
            'Reading': `<svg class="w-5 h-5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fill-rule="evenodd" d="M.458 10C3.732 4.943 9.522 4.5 10 4.5s6.268.443 9.542 5.5c.27.48.27 1.02 0 1.5C16.268 15.057 10.478 15.5 10 15.5s-6.268-.443-9.542-5.5a1.002 1.002 0 010-1.5zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path></svg>`,
            'Completed': `<svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`,
            'On-Hold': `<svg class="w-5 h-5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 6a1 1 0 00-1 1v6a1 1 0 102 0V7a1 1 0 00-1-1zm2 0a1 1 0 00-1 1v6a1 1 0 102 0V7a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`,
            'Dropped': `<svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>`,
            'Plan to Read': `<svg class="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>`
        };
        return icons[status] || '';
    };

    // --- LOCAL STORAGE FUNCTIONS ---
    const saveLibrary = () => {
        localStorage.setItem('manhwaLibrary', JSON.stringify(library));
    };

    const loadLibrary = () => {
        const savedLibrary = localStorage.getItem('manhwaLibrary');
        if (savedLibrary) {
            library = JSON.parse(savedLibrary);
        }
        renderLibrary();
        getHomepageRecommendations();
    };

    // --- RENDER FUNCTIONS ---
    const renderLibrary = () => {
        libraryList.innerHTML = '';
        
        // Update library count
        const libraryCount = document.getElementById('library-count');
        if (libraryCount) {
            libraryCount.textContent = `${library.length} title${library.length !== 1 ? 's' : ''}`;
        }
        
        if (library.length === 0) {
            libraryPlaceholder.classList.remove('hidden');
        } else {
            libraryPlaceholder.classList.add('hidden');
            library.forEach(manhwa => {
                const isCompleted = manhwa.status === 'Completed';
                const currentProgress = isCompleted ? manhwa.lastChapter : manhwa.currentChapter;
                
                const manhwaCard = document.createElement('div');
                manhwaCard.className = 'bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-xl p-4 flex gap-4 shadow-xl card-hover-effect items-start border border-gray-700/50';
                manhwaCard.dataset.id = manhwa.id;

                manhwaCard.innerHTML = `
                    <img src="${manhwa.coverUrl}" alt="Cover for ${manhwa.title}" class="w-28 h-40 object-cover rounded-lg flex-shrink-0 cursor-pointer view-details-btn shadow-lg hover:shadow-xl transition-all duration-300" onerror="this.onerror=null;this.src='https://placehold.co/200x300/111827/FFFFFF?text=No+Cover';">
                    
                    <div class="flex-grow flex flex-col h-40 justify-between">
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="font-bold text-lg mb-1 truncate cursor-pointer view-details-btn hover:underline transition-all duration-200" title="${manhwa.title}">${manhwa.title}</h3>
                                ${getStatusIcon(manhwa.status)}
                            </div>
                            <div class="flex items-center text-xs text-yellow-400 mb-2">
                                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                <span>${manhwa.averageRating ? (manhwa.averageRating / 100).toFixed(1) : 'N/A'}</span>
                            </div>
                            <p class="text-xs text-gray-400">Status: ${manhwa.publicationStatus}</p>
                        </div>
                        
                        <div class="flex items-end gap-2">
                            <div class="flex-grow">
                                <label for="chapter-${manhwa.id}" class="text-xs text-gray-400">Progress</label>
                                <div class="flex items-center gap-2">
                                    <input type="number" id="chapter-${manhwa.id}" data-id="${manhwa.id}" value="${currentProgress || 0}" min="0" ${manhwa.lastChapter ? `max="${manhwa.lastChapter}"` : ''} class="chapter-input w-16 bg-gray-700 border border-gray-600 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs ${isCompleted ? 'bg-gray-800 text-gray-400' : ''}" placeholder="Ch." ${isCompleted ? 'disabled' : ''}>
                                    <span class="text-gray-400 text-xs">/ ${manhwa.lastChapter || '?'}</span>
                                </div>
                            </div>
                            <div class="flex-grow">
                                <label for="status-${manhwa.id}" class="text-xs text-gray-400">My Status</label>
                                <select id="status-${manhwa.id}" data-id="${manhwa.id}" class="status-select w-full bg-gray-700 border border-gray-600 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs">
                                    <option value="Reading" ${manhwa.status === 'Reading' ? 'selected' : ''}>Reading</option>
                                    <option value="Completed" ${manhwa.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                    <option value="On-Hold" ${manhwa.status === 'On-Hold' ? 'selected' : ''}>On-Hold</option>
                                    <option value="Dropped" ${manhwa.status === 'Dropped' ? 'selected' : ''}>Dropped</option>
                                    <option value="Plan to Read" ${manhwa.status === 'Plan to Read' ? 'selected' : ''}>Plan to Read</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex flex-col gap-2 ml-2">
                        <button data-id="${manhwa.id}" class="remove-btn p-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors duration-200 text-xs" title="Remove">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                `;
                libraryList.appendChild(manhwaCard);
            });
        }
    };
    
    const renderSearchResults = (results) => {
        searchResultsContainer.innerHTML = '';
        searchPlaceholder.classList.add('hidden');
        
        // Filter out adult content as additional safety measure
        const filteredResults = results.filter(manhwa => !manhwa.isAdult);
        
        sessionStorage.setItem('lastSearchResults', JSON.stringify(filteredResults)); // Save filtered results for re-rendering
        if (filteredResults.length === 0) {
            searchResultsContainer.innerHTML = `<p class="text-gray-500 text-center py-20">No results found.</p>`;
            return;
        }

        filteredResults.forEach(manhwa => {
            const resultCard = document.createElement('div');
            resultCard.className = 'bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 shadow-xl card-hover-effect border border-gray-700/50';
            const title = manhwa.title.english || manhwa.title.romaji;
            const coverUrl = manhwa.coverImage.medium;
            
            const libraryEntry = library.find(item => item.id == manhwa.id);
            let actionAreaHTML = '';
            if (libraryEntry) {
                actionAreaHTML = `
                    <div class="mt-2 flex items-center gap-2 text-xs font-semibold">
                        ${getStatusIcon(libraryEntry.status)}
                        <span>${libraryEntry.status}</span>
                    </div>
                `;
            } else {
                actionAreaHTML = `<div class="mt-2 ml-4"><button data-id='${manhwa.id}' class="add-btn bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 text-sm rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">Add to Library</button></div>`;
            }

            resultCard.innerHTML = `
                <img src="${coverUrl}" alt="Cover for ${title}" class="w-16 h-24 object-cover rounded-lg flex-shrink-0 shadow-md" onerror="this.onerror=null;this.src='https://placehold.co/128x192/111827/FFFFFF?text=No+Cover';">
                <div class="flex-grow overflow-hidden">
                    <h4 class="font-semibold truncate cursor-pointer view-details-btn hover:underline transition-all duration-200" data-id="${manhwa.id}" title="${title}">${title}</h4>
                    <div class="text-xs text-gray-400 space-y-1">
                        <p>Chapters: ${manhwa.chapters || 'N/A'}</p>
                        <p>Status: ${formatStatus(manhwa.status)}</p>
                    </div>
                    ${actionAreaHTML}
                </div>
            `;
            searchResultsContainer.appendChild(resultCard);
        });
    };

    const renderModal = (manhwa, recommendationsHTML = '') => {
        const title = manhwa.title.english || manhwa.title.romaji;
        const description = (manhwa.description || 'No description available.').replace(/<br\s*\/?>/gi, '\n');
        const coverUrl = manhwa.coverImage.extraLarge;
        const year = manhwa.startDate.year;
        
        modalContent.innerHTML = `
            <div class="flex flex-col md:flex-row gap-6">
                <img src="${coverUrl}" alt="Cover for ${title}" class="w-full md:w-1/3 h-auto object-cover rounded-lg shadow-lg" onerror="this.onerror=null;this.src='https://placehold.co/512x728/111827/FFFFFF?text=No+Cover';">
                <div class="flex-grow">
                    <h2 class="text-3xl font-bold mb-2">${title}</h2>
                    <div class="text-sm text-gray-400 mb-4">
                        <p><strong>Type:</strong> ${formatStatus(manhwa.format)}</p>
                        <p><strong>Status:</strong> ${formatStatus(manhwa.status)}</p>
                        <p><strong>Year:</strong> ${year || 'N/A'}</p>
                    </div>
                    <h3 class="text-xl font-semibold mb-2 border-t border-gray-700 pt-4">Synopsis</h3>
                    <p class="text-gray-300 text-sm whitespace-pre-wrap">${description}</p>
                </div>
            </div>
            <div id="gemini-recommendations" class="mt-4 border-t border-gray-700 pt-4">
                ${recommendationsHTML}
            </div>
        `;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    // --- API HELPER FUNCTIONS ---
    const getHomepageRecommendations = async () => {
        recommendationsLoader.style.display = 'flex';
        recommendationsGrid.innerHTML = '';

        try {
            // Get user's library titles to exclude from recommendations
            const libraryIds = library.map(item => item.id);
            
            // Generate a random page number (1-10) for variety
            const randomPage = Math.floor(Math.random() * 10) + 1;
            
            // Get popular Korean manhwa from AniList (exclude adult content)
            const recommendationsQuery = `
                query ($page: Int) {
                    Page(page: $page, perPage: 20) {
                        media(type: MANGA, countryOfOrigin: "KR", sort: POPULARITY_DESC, status: FINISHED, isAdult: false) {
                            id
                            title { romaji english }
                            coverImage { large }
                            averageScore
                            popularity
                            isAdult
                        }
                    }
                }
            `;
            
            const data = await anilistFetch(recommendationsQuery, { page: randomPage });
            let allRecommendations = data.data.Page.media || [];
            
            // Filter out titles already in user's library and adult content
            allRecommendations = allRecommendations.filter(rec => 
                !libraryIds.includes(rec.id) && !rec.isAdult
            );
            
            // If we don't have enough from this page, get more from different sorting
            if (allRecommendations.length < 5) {
                const additionalQuery = `
                    query {
                        Page(page: 1, perPage: 15) {
                            media(type: MANGA, countryOfOrigin: "KR", sort: SCORE_DESC, status: FINISHED, isAdult: false) {
                                id
                                title { romaji english }
                                coverImage { large }
                                averageScore
                                popularity
                                isAdult
                            }
                        }
                    }
                `;
                
                const additionalData = await anilistFetch(additionalQuery);
                const additionalRecs = (additionalData.data.Page.media || [])
                    .filter(rec => 
                        !libraryIds.includes(rec.id) && 
                        !rec.isAdult && 
                        !allRecommendations.find(existing => existing.id === rec.id)
                    );
                
                allRecommendations.push(...additionalRecs);
            }
            
            // Shuffle the array and take 5 random recommendations
            const shuffled = allRecommendations.sort(() => 0.5 - Math.random());
            const recommendations = shuffled.slice(0, 5);
            
            // Render recommendations with proper alignment
            recommendations.forEach(rec => {
                const recCard = document.createElement('div');
                recCard.className = 'bg-gray-900 rounded-lg p-3 flex flex-col gap-2 shadow-md card-hover-effect h-full';
                const recTitle = rec.title.english || rec.title.romaji;
                recCard.innerHTML = `
                    <img src="${rec.coverImage.large}" alt="Cover for ${recTitle}" class="w-full h-48 object-cover rounded-md" onerror="this.onerror=null;this.src='https://placehold.co/200x280/111827/FFFFFF?text=No+Cover';">
                    <h4 class="font-semibold text-center flex-grow flex items-center justify-center min-h-[2.5rem]" title="${recTitle}">${recTitle}</h4>
                    <button data-id='${rec.id}' class="add-btn mt-auto w-full bg-indigo-600 text-white px-3 py-1 text-xs rounded-md font-semibold hover:bg-indigo-700 transition-colors duration-200">Add to Library</button>
                `;
                recommendationsGrid.appendChild(recCard);
            });

        } catch (error) {
            console.error("AniList recommendation failed:", error);
            
            // Fallback to hardcoded popular titles
            const fallbackTitles = [
                'Solo Leveling',
                'Tower of God',
                'The Beginning After The End',
                'Omniscient Reader\'s Viewpoint',
                'Lookism',
                'God of High School',
                'Noblesse'
            ];
            
            const recommendationPromises = fallbackTitles.map(async title => {
                const searchQuery = `
                    query ($search: String) {
                        Page(page: 1, perPage: 1) {
                            media(search: $search, type: MANGA, countryOfOrigin: "KR", sort: SEARCH_MATCH) {
                                id
                                title { romaji english }
                                coverImage { large }
                            }
                        }
                    }
                `;
                try {
                    const data = await anilistFetch(searchQuery, { search: title });
                    return data.data.Page.media[0];
                } catch (error) {
                    console.error(`Failed to fetch ${title}:`, error);
                    return null;
                }
            });

            const recommendations = (await Promise.all(recommendationPromises)).filter(Boolean).slice(0, 5);
            
            recommendations.forEach(rec => {
                const recCard = document.createElement('div');
                recCard.className = 'bg-gray-900 rounded-lg p-3 flex flex-col gap-2 shadow-md card-hover-effect h-full';
                const recTitle = rec.title.english || rec.title.romaji;
                recCard.innerHTML = `
                    <img src="${rec.coverImage.large}" alt="Cover for ${recTitle}" class="w-full h-48 object-cover rounded-md" onerror="this.onerror=null;this.src='https://placehold.co/200x280/111827/FFFFFF?text=No+Cover';">
                    <h4 class="font-semibold text-center flex-grow flex items-center justify-center min-h-[2.5rem]" title="${recTitle}">${recTitle}</h4>
                    <button data-id='${rec.id}' class="add-btn mt-auto w-full bg-indigo-600 text-white px-3 py-1 text-xs rounded-md font-semibold hover:bg-indigo-700 transition-colors duration-200">Add to Library</button>
                `;
                recommendationsGrid.appendChild(recCard);
            });
        } finally {
            recommendationsLoader.style.display = 'none';
        }
    };
    


    const anilistFetch = async (query, variables) => {
        const response = await fetch(ANILIST_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ query, variables })
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    };
    
    // --- EVENT HANDLERS ---
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;

        libraryView.classList.add('hidden');
        searchView.classList.remove('hidden');
        loader.style.display = 'flex';
        searchResultsContainer.innerHTML = '';
        searchPlaceholder.classList.add('hidden');
        
        const searchQuery = `
            query ($search: String) {
                Page(page: 1, perPage: 20) {
                    media(search: $search, type: MANGA, countryOfOrigin: "KR", sort: SEARCH_MATCH, isAdult: false) {
                        id
                        title { romaji english }
                        coverImage { medium }
                        chapters
                        status
                        isAdult
                    }
                }
            }
        `;

        try {
            const data = await anilistFetch(searchQuery, { search: query });
            renderSearchResults(data.data.Page.media);
        } catch (error) {
            console.error('Search failed:', error);
            searchResultsContainer.innerHTML = `<p class="text-red-400 text-center py-20">Failed to fetch results. Please try again later.</p>`;
        } finally {
            loader.style.display = 'none';
        }
    });

    backToLibraryBtn.addEventListener('click', () => {
        searchView.classList.add('hidden');
        libraryView.classList.remove('hidden');
        searchResultsContainer.innerHTML = '';
        searchInput.value = '';
    });

    // Home page navigation function
    const goToHomePage = () => {
        // Go back to library view (home page)
        searchView.classList.add('hidden');
        libraryView.classList.remove('hidden');
        searchResultsContainer.innerHTML = '';
        searchInput.value = '';
        
        // Close any open modals
        const accountModal = document.getElementById('account-modal');
        const detailsModal = document.getElementById('details-modal');
        if (accountModal) {
            accountModal.classList.add('hidden');
            accountModal.classList.remove('flex');
        }
        if (detailsModal) {
            detailsModal.classList.add('hidden');
            detailsModal.classList.remove('flex');
        }
        
        // Remove any user menus
        const existingMenu = document.getElementById('user-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Home page navigation - clicking the title or logo goes to home
    const homeTitle = document.getElementById('home-title');
    const homeLogo = document.getElementById('home-logo');
    
    if (homeTitle) {
        homeTitle.addEventListener('click', goToHomePage);
    }
    
    if (homeLogo) {
        homeLogo.addEventListener('click', goToHomePage);
    };

    document.body.addEventListener('click', async (e) => {
        const addBtn = e.target.closest('.add-btn');
        if (addBtn) {
            const manhwaId = addBtn.dataset.id;
            if (library.some(m => m.id == manhwaId)) {
                showNotification('This manhwa is already in your library.');
                return;
            }

            const detailsQuery = `
                query ($id: Int) {
                    Media(id: $id, type: MANGA) {
                        id
                        title { romaji english }
                        coverImage { large }
                        chapters
                        status
                        averageScore
                    }
                }
            `;
            const data = await anilistFetch(detailsQuery, { id: manhwaId });
            const manhwaData = data.data.Media;

            const newLibraryItem = {
                id: manhwaData.id,
                title: manhwaData.title.english || manhwaData.title.romaji,
                coverUrl: manhwaData.coverImage.large,
                lastChapter: manhwaData.chapters,
                currentChapter: 0,
                status: 'Plan to Read',
                averageRating: manhwaData.averageScore,
                publicationStatus: formatStatus(manhwaData.status)
            };

            library.push(newLibraryItem);
            saveLibrary();
            renderLibrary();
            if(!searchView.classList.contains('hidden')) {
                renderSearchResults(JSON.parse(sessionStorage.getItem('lastSearchResults') || '[]'));
            }
            showNotification(`${newLibraryItem.title} added to library!`);
        }
    });

    libraryList.addEventListener('click', async (e) => {
        const removeBtn = e.target.closest('.remove-btn');
        const detailsBtn = e.target.closest('.view-details-btn');

        if (removeBtn) {
            const manhwaId = removeBtn.closest('[data-id]').dataset.id;
            library = library.filter(m => m.id != manhwaId);
            saveLibrary();
            renderLibrary();
        } else if (detailsBtn) {
            const manhwaId = detailsBtn.closest('[data-id]').dataset.id;
            const detailsQuery = `
                query ($id: Int) {
                    Media(id: $id, type: MANGA) {
                        id
                        title { romaji english }
                        description(asHtml: false)
                        coverImage { extraLarge }
                        status
                        format
                        startDate { year }
                    }
                }
            `;
            const data = await anilistFetch(detailsQuery, { id: manhwaId });
            if (data.data.Media) {
                renderModal(data.data.Media);
            }
        }
    });

    // Event listener for search results titles
    searchResultsContainer.addEventListener('click', async (e) => {
        const detailsBtn = e.target.closest('.view-details-btn');
        if (detailsBtn) {
            const manhwaId = detailsBtn.dataset.id;
            const detailsQuery = `
                query ($id: Int) {
                    Media(id: $id, type: MANGA) {
                        id
                        title { romaji english }
                        description(asHtml: false)
                        coverImage { extraLarge }
                        status
                        format
                        startDate { year }
                    }
                }
            `;
            const data = await anilistFetch(detailsQuery, { id: manhwaId });
            if (data.data.Media) {
                renderModal(data.data.Media);
            }
        }
    });

    // Event listener for recommendations titles
    recommendationsGrid.addEventListener('click', async (e) => {
        const detailsBtn = e.target.closest('.view-details-btn');
        if (detailsBtn) {
            const manhwaId = detailsBtn.dataset.id;
            const detailsQuery = `
                query ($id: Int) {
                    Media(id: $id, type: MANGA) {
                        id
                        title { romaji english }
                        description(asHtml: false)
                        coverImage { extraLarge }
                        status
                        format
                        startDate { year }
                    }
                }
            `;
            const data = await anilistFetch(detailsQuery, { id: manhwaId });
            if (data.data.Media) {
                renderModal(data.data.Media);
            }
        }
    });
    
    libraryList.addEventListener('change', (e) => {
        const manhwaId = e.target.dataset.id;
        const manhwa = library.find(m => m.id == manhwaId);
        if (!manhwa) return;

        if (e.target.classList.contains('status-select')) {
            const newStatus = e.target.value;
            const oldStatus = manhwa.status;

            if (newStatus === 'Completed' && oldStatus !== 'Completed') {
                if (manhwa.currentChapter !== manhwa.lastChapter) {
                    manhwa.preCompletionProgress = manhwa.currentChapter;
                }
                manhwa.currentChapter = manhwa.lastChapter;
            } else if (oldStatus === 'Completed' && newStatus !== 'Completed') {
                if (typeof manhwa.preCompletionProgress === 'number') {
                    manhwa.currentChapter = manhwa.preCompletionProgress;
                }
            }
            
            manhwa.status = newStatus;
            saveLibrary();
            renderLibrary();
        }
        
        if (e.target.classList.contains('chapter-input')) {
             manhwa.currentChapter = parseInt(e.target.value, 10) || 0;
             saveLibrary();
        }
    });
    
    // --- MODAL EVENTS ---
    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    });

    // --- ACCOUNT MODAL EVENTS ---
    accountBtn.addEventListener('click', () => {
        accountModal.classList.remove('hidden');
        accountModal.classList.add('flex');
        // Show login form by default
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        forgotPasswordForm.classList.add('hidden');
    });

    closeAccountModalBtn.addEventListener('click', () => {
        accountModal.classList.add('hidden');
        accountModal.classList.remove('flex');
    });

    accountModal.addEventListener('click', (e) => {
        if (e.target === accountModal) {
            accountModal.classList.add('hidden');
            accountModal.classList.remove('flex');
        }
    });

    // Switch between login and signup forms
    showSignupBtn.addEventListener('click', () => {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        forgotPasswordForm.classList.add('hidden');
    });

    showLoginBtn.addEventListener('click', () => {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        forgotPasswordForm.classList.add('hidden');
    });

    // Switch to forgot password form
    showForgotPasswordBtn.addEventListener('click', () => {
        loginForm.classList.add('hidden');
        signupForm.classList.add('hidden');
        forgotPasswordForm.classList.remove('hidden');
    });

    // Switch back to login from forgot password
    backToLoginBtn.addEventListener('click', () => {
        forgotPasswordForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });

    // Handle login form submission
    loginFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // For now, just show a success message
        showNotification('Login functionality coming soon!');
        
        // Close the modal
        accountModal.classList.add('hidden');
        accountModal.classList.remove('flex');
        
        // Reset form
        loginFormElement.reset();
    });

    // Handle signup form submission
    signupFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        
        // Basic validation
        if (password !== confirmPassword) {
            showNotification('Passwords do not match!', true);
            return;
        }
        
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters long!', true);
            return;
        }
        
        // For now, just show a success message
        showNotification('Account creation functionality coming soon!');
        
        // Close the modal
        accountModal.classList.add('hidden');
        accountModal.classList.remove('flex');
        
        // Reset form
        signupFormElement.reset();
    });

    // Handle forgot password form submission
    forgotPasswordFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address!', true);
            return;
        }
        
        // For now, just show a success message
        showNotification('Password reset link sent to your email!');
        
        // Close the modal
        accountModal.classList.add('hidden');
        accountModal.classList.remove('flex');
        
        // Reset form
        forgotPasswordFormElement.reset();
        
        // Switch back to login form for next time
        forgotPasswordForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });

    // Update recommendation grid styling when items are added
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList.contains('bg-gray-900')) {
                        // Update old styling to new modern styling
                        node.className = node.className.replace(
                            'bg-gray-900 rounded-lg p-3 flex flex-col gap-2 shadow-md card-hover-effect',
                            'bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-xl p-4 flex flex-col gap-3 shadow-xl card-hover-effect border border-gray-700/50'
                        );
                        
                        // Update button styling
                        const button = node.querySelector('.add-btn');
                        if (button) {
                            button.className = button.className.replace(
                                'bg-indigo-600 text-white px-3 py-1 text-xs rounded-md font-semibold hover:bg-indigo-700 transition-colors duration-200',
                                'bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 text-sm rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105'
                            );
                        }
                        
                        // Update image styling
                        const img = node.querySelector('img');
                        if (img) {
                            img.className = img.className.replace('rounded-md', 'rounded-lg shadow-lg');
                        }
                        
                        // Update title styling
                        const title = node.querySelector('h4');
                        if (title) {
                            title.classList.add('text-white', 'cursor-pointer', 'view-details-btn', 'hover:underline');
                            title.classList.add('transition-all', 'duration-200');
                            if (!title.hasAttribute('data-id')) {
                                // Get the data-id from the button in the same card
                                const button = node.querySelector('.add-btn');
                                if (button && button.dataset.id) {
                                    title.setAttribute('data-id', button.dataset.id);
                                    title.setAttribute('title', title.textContent);
                                }
                            }
                        }
                    }
                });
            }
        });
    });

    // Observe the recommendations grid
    if (recommendationsGrid) {
        observer.observe(recommendationsGrid, { childList: true });
    }

    // --- INITIALIZATION ---
    loadLibrary();
});
