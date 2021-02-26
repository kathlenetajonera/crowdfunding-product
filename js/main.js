const navicon = document.querySelector(".nav__toggle");
const menu = document.querySelector(".nav__menu");
const overlay = document.querySelector(".overlay");
const bookmarkBtn = document.querySelector(".card__bookmark");
const LOCAL_STORAGE_BOOKMARK = localStorage.getItem("isBookmarked") || [];
const savedPledges = [];
const rewardSelection = document.querySelectorAll("[data-select-reward]");
const pledgeBtn = document.querySelector("#pledgeBtn");
const modals = document.querySelectorAll(".modal");
const modalCloseBtns = document.querySelectorAll(".modal__close");
const modalItems = document.querySelectorAll(".modal__item");
const backersCount = document.querySelector("#backers-count");
let currentCount = parseInt(backersCount.dataset.count);
const totalMoneyRaised = document.querySelector("#total-money-raised");
let currentTotal = parseInt(totalMoneyRaised.dataset.total);
const progressBar = document.querySelector(".card__progress");

const disableScrolling = () => document.body.style.position = "fixed";
const enablecrolling = () => document.body.style.position = "";
let windowWidth = window.innerWidth;

navicon.addEventListener("click", toggleMobileMenu);
bookmarkBtn.addEventListener("click", updateBookmark);

pledgeBtn.addEventListener("click", openPledgeModal);

rewardSelection.forEach(reward => {
    reward.addEventListener("click", () => {
        const target = reward.dataset.target;
        const targetItem = document.getElementById(target);

        openPledgeModal();
        selectPledge(targetItem);
        smoothScroll(targetItem);
    })
})

modalItems.forEach(item => {
    item.addEventListener("click", e => {
        let target = e.target;
        const itemCard = target.closest(".modal__item");

        if (target.classList.contains("form__pledge-value")) {
            e.stopPropagation();

            //handles enter key
            target.addEventListener("keydown", e => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    validatePledge(itemCard);
                }
            })
        } else if (target.hasAttribute("data-enter-pledge")) {
            const inputField = item.querySelector(".form__pledge-value");

            inputField.click();
            inputField.focus();
        } else if (target.hasAttribute("data-continue")) {
            e.preventDefault();
            const isFree = target.parentElement.classList.contains("modal__enter-pledge--free");

            if (isFree) {
                savePledge("None", "0");
                deselectPledge(itemCard);
            } else {
                validatePledge(itemCard);
            }
            
        } else {
            selectPledge(itemCard);
        }
    })
})

modalCloseBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const activeModal = btn.closest(".modal");

        removeClass("active", overlay);
        removeClass("active", activeModal);
    })
})

window.addEventListener("resize", () => {
    if (windowWidth != window.innerWidth) {
        windowWidth = window.innerWidth;

        if (windowWidth > 768) {
            if (navicon.classList.contains("nav__toggle--active")) {
                removeClass("active", navicon);
                removeClass("open", menu);
                removeClass("menu-active", overlay);
    
                navicon.setAttribute("aria-expanded", "false");
                enablecrolling();
            }
        }
    }
})

checkStorage();
updateProgressBar();

function toggleMobileMenu() {
    const isOpen = navicon.getAttribute("aria-expanded");

    if (isOpen === "true") {
        animateMobileMenu("close");
        removeClass("active", navicon);
        removeClass("menu-active", overlay);

        navicon.setAttribute("aria-expanded", "false");
        enablecrolling();
    } else {
        animateMobileMenu("open");
        addClass("active", navicon);
        addClass("menu-active", overlay);
        
        navicon.setAttribute("aria-expanded", "true");
        disableScrolling();
    }
}

function animateMobileMenu(animate) {
    if (animate === "open") {
        removeClass("close", menu);
        addClass("open", menu);
    } else {
        removeClass("open", menu)
        addClass("close", menu);

        setTimeout(() => {
            removeClass("close", menu);
        }, 1000);
    }
}

function updateBookmark() {
    // if (LOCAL_STORAGE_BOOKMARK) {
    //     if (LOCAL_STORAGE_BOOKMARK === "true") {
    //         addClass("active", bookmarkBtn);
    //     }
    // } else {
    //     if (bookmarkBtn.classList.contains("card__bookmark--active")) {
    //         removeClass("active", bookmarkBtn);
    //         localStorage.setItem("isBookmarked", false);
    //     } else {
    //         addClass("active", bookmarkBtn);
    //         localStorage.setItem("isBookmarked", true);
    //     }
    // }

    if (bookmarkBtn.classList.contains("card__bookmark--active")) {
        removeClass("active", bookmarkBtn);
        localStorage.setItem("isBookmarked", false);
    } else {
        addClass("active", bookmarkBtn);
        localStorage.setItem("isBookmarked", true);
    }
}

function addClass(className, element) {
    const blockName = element.classList[0];

    element.classList.add(`${blockName}--${className}`)
}

function removeClass(className, element) {
    const blockName = element.classList[0];

    element.classList.remove(`${blockName}--${className}`)
}

function openPledgeModal() {
    const pledgeSelectionModal = Array.from(modals).find(modal => modal.classList.contains("modal--pledge-selection"));

    addClass("active", overlay);
    addClass("active", pledgeSelectionModal);
}

function selectPledge(selectedItem) {
    const radioBtn = selectedItem.querySelector(".form__radio-input");
    const isChecked = radioBtn.checked;

    if (isChecked) {
        deselectPledge(selectedItem);
    } else {
        radioBtn.checked = true;

        //removes selected class on all items
        modalItems.forEach(item => {
            removeClass("selected", item);
        })

        addClass("selected", selectedItem);
    }
}

function deselectPledge(item) {
    const radioBtn = item.querySelector(".form__radio-input");
    const inputField = item.querySelector(".form__pledge-value");

    modalItems.forEach(item => {
        removeClass("selected", item);
    })

    radioBtn.checked = false;
    
    if (!item.classList.contains("modal__item--free")) {
        inputField.value = "";
    }
}

function validatePledge(item) {
    const itemName = item.querySelector(".modal__item-name").textContent;
    const inputText = item.querySelector("[data-enter-pledge]");
    const inputField = item.querySelector(".form__pledge-value");
    const pledgeMinimum = item.querySelector(".form__pledge-value").placeholder;
    const numberPattern = /^(\d{1,6})$/;

    if (numberPattern.test(inputField.value)) {
        if (parseInt(inputField.value) >= parseInt(pledgeMinimum)) {
            removeClass("error", inputText);
            inputText.textContent = "Enter your pledge";

            savePledge(itemName, inputField.value);
            deselectPledge(item);
        } else {
            errorMessage("short");
        }
    } else {
        errorMessage("invalid");
    }

    function errorMessage(type) {
        addClass("error", inputText);
        
        if (type === "short") {
            inputText.textContent = `Minimum pledge amount: $${pledgeMinimum}`;
        } else if (type === "invalid") {
            inputText.textContent = "Please enter a valid amount";
        }
    }
}

function savePledge(item, value) {
    const pledge = {
        id: generateID(),
        date: new Date().toLocaleString(),
        item: item,
        pledgeValue: value
    }

    const targetAmount = 100000;

    if (currentTotal < targetAmount) {
        currentTotal += parseInt(value);

        totalMoneyRaised.setAttribute("data-total", currentTotal);

        savedPledges.push(pledge)
        console.log(savedPledges);

        displayConfirmation();
        updateBackersCount();
        updateTotalMoneyRaised(currentTotal);
    } else {
        alert("Target amount has been reached. Thanks for your support!")
    }
}

function displayConfirmation() {
    const modalSelection = document.querySelector(".modal--pledge-selection");
    const modalConfirmation = document.querySelector(".modal--confirmation");

    removeClass("active", modalSelection);
    addClass("active", modalConfirmation);
}

function updateBackersCount() {
    const numberFormat = new Intl.NumberFormat("en");

    currentCount++;
    backersCount.setAttribute("data-count", currentCount)

    backersCount.textContent = numberFormat.format(currentCount);
}

function updateTotalMoneyRaised(total) {
    const currencyFormat = new Intl.NumberFormat("en", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    totalMoneyRaised.textContent = currencyFormat.format(total);

    updateProgressBar();
}

function updateProgressBar() {
    const targetAmount = 100000;
    const progress = Math.floor((currentTotal / targetAmount) * 100);

    progressBar.style.width = progress + "%";
}

function checkStorage() {
    if (LOCAL_STORAGE_BOOKMARK) {
        if (LOCAL_STORAGE_BOOKMARK === "true") {
            addClass("active", bookmarkBtn);
        }
    }
}

function generateID() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charsArr = chars.split("");
    const randomIndex = () => Math.floor(Math.random() * charsArr.length);
    let uniqueID = "";

    for (i=0; i<6; i++) {
        const index = randomIndex();
        uniqueID += charsArr[index];
    }

    return uniqueID;
}

function smoothScroll(target) {
    const targetSection = target;
    const targetPosition = (targetSection.getBoundingClientRect().top + window.pageYOffset) - 100; // minus 100 to have space at the top
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let startTime;

    function animation(currentTime) {
        if (startTime === undefined) startTime = currentTime;

        const timeElapsed =  currentTime - startTime;
        let scroll = ease(timeElapsed, startPosition, distance, duration);

        window.scrollTo(0, scroll);

        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    function ease(t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };

    requestAnimationFrame(animation);
}