const navbar = document.querySelector(".nav");
const navicon = document.querySelector(".nav__toggle");
const menu = document.querySelector(".nav__menu");
const overlay = document.querySelector(".overlay");
const bookmarkBtn = document.querySelector(".card__bookmark");
const LOCAL_STORAGE_BOOKMARK = localStorage.getItem("isBookmarked") || [];
const savedPledges = [];
const rewardSelection = document.querySelectorAll("[data-selection]");
const pledgeBtn = document.querySelector("#pledgeBtn");
const modals = document.querySelectorAll(".modal");
const modalCloseBtns = document.querySelectorAll(".modal__close");
const modalItems = document.querySelectorAll(".modal__item");
const backersCount = document.querySelector("#backers-count");
let currentCount = parseInt(backersCount.dataset.count);

const disableScrolling = () => document.body.style.position = "fixed";
const enablecrolling = () => document.body.style.position = "";
let windowWidth = window.innerWidth;

navicon.addEventListener("click", toggleMobileMenu);
bookmarkBtn.addEventListener("click", updateBookmark);

checkStorage();

function toggleMobileMenu() {
    const isOpen = navicon.getAttribute("aria-expanded");

    if (isOpen === "true") {
        animateMobileMenu("close");
        removeClass("active", navicon);
        removeClass("active", overlay);

        navicon.setAttribute("aria-expanded", "false");
        enablecrolling();
    } else {
        animateMobileMenu("open");
        addClass("active", navicon);
        addClass("active", overlay);
        
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

function checkStorage() {
    if (LOCAL_STORAGE_BOOKMARK) {
        if (LOCAL_STORAGE_BOOKMARK === "true") {
            addClass("active", bookmarkBtn);
        }
    }
}

window.addEventListener("resize", () => {
    if (windowWidth != window.innerWidth) {
        windowWidth = window.innerWidth;

        if (windowWidth > 768) {
            removeClass("active", navicon);
            removeClass("open", menu);
            removeClass("active", overlay);

            navicon.setAttribute("aria-expanded", "false");
            enablecrolling();
        }
    }
})

pledgeBtn.addEventListener("click", openPledgeModal)

modalCloseBtns.forEach(btn => {
    btn.addEventListener("click", e => {
        const activeModal = btn.closest(".modal");

        removeClass("active", overlay);
        removeClass("active", activeModal);
    })
})

rewardSelection.forEach(reward => {
    reward.addEventListener("click", () => {
        const target = reward.dataset.target;
        const targetItem = document.getElementById(target);

        openPledgeModal();
        selectPledge(targetItem);
    })
})

modalItems.forEach(item => {
    item.addEventListener("click", e => {
        const target = e.target;
        const itemCard = target.closest(".modal__item");

        if (target.classList.contains("form__pledge-value")) {
            e.stopPropagation();
        } else if (target.hasAttribute("data-continue")) {
            e.preventDefault();
            const isFree = target.parentElement.classList.contains("modal__enter-pledge--free");

            if (isFree) {
                savePledge("None", 0)
            } else {
                validatePledge(itemCard);
            }
            
        } else {
            selectPledge(itemCard);
        }
    })
})

function openPledgeModal() {
    const pledgeSelectionModal = Array.from(modals).find(modal => modal.classList.contains("modal--pledge-selection"));

    addClass("active", overlay);
    addClass("active", pledgeSelectionModal);
}

function selectPledge(selectedItem) {
    const radioInput = selectedItem.querySelector(".form__radio-input");
    const pledgeCostBtn = selectedItem.querySelector(".button--cost");
    const isChecked = radioInput.checked;

    if (isChecked) {
        radioInput.checked = false;
        removeClass("selected", selectedItem);
        // removeClass("cost-active", pledgeCostBtn);
    } else {
        radioInput.checked = true;

        //removes selected class on all items
        modalItems.forEach(item => {
            removeClass("selected", item);
        })

        addClass("selected", selectedItem);
    }
}

function validatePledge(item) {
    const itemName = item.querySelector(".modal__item-name").textContent;
    const pledgeValue = item.querySelector(".form__pledge-value").value;
    const pledgeMinimum = parseInt(item.querySelector(".form__pledge-value").placeholder)
    const numberPattern = /^(\d{1,6})$/;

    if (numberPattern.test(pledgeValue)) {
        if (parseInt(pledgeValue) >= pledgeMinimum) {
            savePledge(itemName, pledgeValue)
        } else {
            console.log("short");
        }
    } else {
        console.log("error");
    }
}

function savePledge(item, value) {
    const pledge = {
        id: generateID(),
        date: Date.now(),
        item: item,
        pledgeValue: value
    }

    savedPledges.push(pledge)
    // console.log(savedPledges);

    displayConfirmation();
    updateBackersCount();
    updateTotalMoneyRaised(value);
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

    backersCount.textContent = numberFormat.format(currentCount);
}

const totalMoneyRaised = document.querySelector("#total-money-raised");
let currentTotal = parseInt(totalMoneyRaised.dataset.total);

function updateTotalMoneyRaised(value) {
    const pledgeAmount = parseInt(value);
    const currencyFormat = new Intl.NumberFormat("en", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    });

    currentTotal += pledgeAmount;

    totalMoneyRaised.textContent = currencyFormat.format(currentTotal);

    //di nagrereflect yung bagong total sa data-total
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