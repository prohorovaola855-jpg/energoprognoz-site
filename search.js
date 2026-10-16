(() => {
    "use strict";

    // Публичные страницы, участвующие в поиске.
    // Новые страницы добавляй в этот список.

    const scriptUrl = document.currentScript.src;
    const siteRoot = new URL("../", scriptUrl);

    const pages = [
        { path: "index.html", title: "Главная" },
        { path: "services.html", title: "Услуги" },
        { path: "consumers.html", title: "Потребителям" },
        { path: "contacts.html", title: "Контакты" }
    ];

    const searchButtons = document.querySelectorAll(".search-button");

    if (!searchButtons.length) {
        return;
    }

    // Создаём окно поиска один раз.

    const dialog = document.createElement("dialog");

    dialog.className = "site-search";
    dialog.setAttribute("aria-labelledby", "site-search-title");

    dialog.innerHTML = `
        <div class="site-search-top">
            <h2 id="site-search-title">Поиск по сайту</h2>

            <button
                class="site-search-close"
                type="button"
                aria-label="Закрыть поиск"
            >
                ×
            </button>
        </div>

        <form class="site-search-form" role="search">
            <label for="site-search-input">
                Что вы хотите найти?
            </label>

            <div class="site-search-controls">
                <input
                    id="site-search-input"
                    name="query"
                    type="search"
                    placeholder="Например, договор или показания"
                    autocomplete="off"
                    minlength="2"
                    maxlength="150"
                    required
                >

                <button type="submit">Найти</button>
            </div>
        </form>

        <p
            class="site-search-status"
            role="status"
            aria-live="polite"
        ></p>

        <ul class="site-search-results"></ul>
    `;

    document.body.append(dialog);

    const form = dialog.querySelector(".site-search-form");
    const input = dialog.querySelector("#site-search-input");
    const closeButton = dialog.querySelector(".site-search-close");
    const status = dialog.querySelector(".site-search-status");
    const results = dialog.querySelector(".site-search-results");

    let indexPromise = null;
    let requestNumber = 0;
    let previousFocus = null;

    function normalize(text) {
        return text
            .toLocaleLowerCase("ru")
            .replace(/ё/g, "е");
    }

    function cleanText(text) {
        return text.replace(/\s+/g, " ").trim();
    }

    // Загружаем только заранее перечисленные публичные страницы.
    // Шапка, подвал, скрипты и технические пометки не индексируются.

    async function loadPage(page) {
        const url = new URL(page.path, siteRoot);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
            const response = await fetch(url, {
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`Не удалось загрузить ${page.path}`);
            }

            const html = await response.text();

            const documentCopy = new DOMParser().parseFromString(
                html,
                "text/html"
            );

            const main = documentCopy.querySelector("main");

            if (!main) {
                throw new Error(`На странице ${page.path} нет main`);
            }

            main.querySelectorAll(
                "script, style, template, noscript, " +
                "[hidden], [aria-hidden='true'], " +
                ".business-breadcrumbs, .consumer-breadcrumbs"
            ).forEach(element => element.remove());

            const text = cleanText(
                main.textContent.replace(
                    /\[ЗАПОЛНИТЬ:[\s\S]*?\]/g,
                    ""
                )
            );

            if (!text) {
                throw new Error(`На странице ${page.path} нет текста`);
            }

            const heading = main.querySelector("h1");

            return {
                title: cleanText(heading?.textContent || page.title),
                url: url.href,
                text,
                normalizedText: normalize(text)
            };
        } finally {
            clearTimeout(timeout);
        }
    }

    async function buildIndex() {
        const loaded = await Promise.allSettled(
            pages.map(loadPage)
        );

        const documents = loaded
            .filter(item => item.status === "fulfilled")
            .map(item => item.value);

        return {
            documents,
            failedCount: loaded.length - documents.length
        };
    }

    function getIndex() {
        if (!indexPromise) {
            indexPromise = buildIndex().then(index => {
                // При неполной загрузке следующая попытка
                // сможет повторить запросы.

                if (index.failedCount > 0) {
                    indexPromise = null;
                }

                return index;
            });
        }

        return indexPromise;
    }

    function createSnippet(page, words) {
        let position = page.normalizedText.length;

        for (const word of words) {
            const found = page.normalizedText.indexOf(word);

            if (found !== -1) {
                position = Math.min(position, found);
            }
        }

        const start = Math.max(0, position - 70);
        const end = Math.min(page.text.length, start + 230);

        return (
            (start > 0 ? "… " : "") +
            page.text.slice(start, end) +
            (end < page.text.length ? "…" : "")
        );
    }

    function renderResults(matches, words) {
        results.replaceChildren();

        for (const page of matches) {
            const item = document.createElement("li");
            const link = document.createElement("a");
            const title = document.createElement("h3");
            const snippet = document.createElement("p");

            link.href = page.url;
            title.textContent = page.title;
            snippet.textContent = createSnippet(page, words);

            link.append(title, snippet);
            item.append(link);
            results.append(item);
        }
    }

    function openSearch() {
        if (dialog.open) {
            return;
        }

        previousFocus = document.activeElement;

        dialog.showModal();
        document.documentElement.classList.add("site-search-is-open");
        input.focus();
    }

    function closeSearch() {
        dialog.close();
    }

    searchButtons.forEach(button => {
        button.setAttribute("aria-haspopup", "dialog");
        button.addEventListener("click", openSearch);
    });

    closeButton.addEventListener("click", closeSearch);

    // Закрытие по нажатию за пределами окна.

    dialog.addEventListener("click", event => {
        if (event.target !== dialog) {
            return;
        }

        const bounds = dialog.getBoundingClientRect();

        const outside =
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom;

        if (outside) {
            closeSearch();
        }
    });

    // Escape обрабатывается самим dialog.

    dialog.addEventListener("close", () => {
        requestNumber++;
        document.documentElement.classList.remove("site-search-is-open");
        form.removeAttribute("aria-busy");

        if (previousFocus?.isConnected) {
            previousFocus.focus();
        }
    });

    // Изменение запроса отменяет вывод устаревших результатов.

    input.addEventListener("input", () => {
        requestNumber++;
        results.replaceChildren();
        status.textContent = "";
        form.removeAttribute("aria-busy");
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const query = normalize(input.value.trim());

        const words = query
            .split(/[^\p{L}\p{N}]+/u)
            .filter(Boolean);

        if (query.length < 2 || words.join("").length < 2) {
            status.textContent = "Введите хотя бы две буквы или цифры.";
            results.replaceChildren();
            return;
        }

        if (window.location.protocol === "file:") {
            status.textContent =
                "Откройте сайт через Live Server или хостинг: " +
                "браузер запрещает загружать страницы через file:///.";
            return;
        }

        const currentRequest = ++requestNumber;

        status.textContent = "Ищем…";
        results.replaceChildren();
        form.setAttribute("aria-busy", "true");

        try {
            const index = await getIndex();

            if (currentRequest !== requestNumber) {
                return;
            }

            if (!index.documents.length) {
                status.textContent =
                    "Не удалось загрузить страницы для поиска. " +
                    "Проверьте подключение и попробуйте ещё раз.";
                return;
            }

            const matches = index.documents
                .filter(page =>
                    words.every(word =>
                        page.normalizedText.includes(word)
                    )
                )
                .map(page => {
                    const title = normalize(page.title);

                    const titleMatches = words.filter(word =>
                        title.includes(word)
                    ).length;

                    return {
                        ...page,
                        score: titleMatches
                    };
                })
                .sort((first, second) => second.score - first.score);

            renderResults(matches, words);

            status.textContent = matches.length
                ? `Найдено страниц: ${matches.length}.`
                : "Ничего не найдено. Попробуйте другое слово.";

            if (index.failedCount > 0) {
                status.textContent +=
                    " Часть страниц недоступна, результаты неполные.";
            }
        } catch {
            if (currentRequest === requestNumber) {
                status.textContent =
                    "Поиск временно недоступен. Попробуйте ещё раз.";
            }
        } finally {
            if (currentRequest === requestNumber) {
                form.removeAttribute("aria-busy");
            }
        }
    });
})();