import localforage from "localforage"; // Импортируем библиотеку для работы с локальным хранилищем
import {matchSorter} from "match-sorter"; // Импортируем функцию для сортировки совпадений
import sortBy from "sort-by"; // Импортируем функцию для сортировки массива объектов

// Асинхронная функция для получения списка контактов по запросу
export async function getContacts(query) {
    // Имитация сетевого запроса
    await fakeNetwork(`getContacts:${query}`)
    ;

    // Получаем контакты из локального хранилища
    let contacts = await localforage.getItem("contacts");

    // Если контакты не найдены, инициализируем пустым массивом
    if (!contacts) contacts = [];

    // Если есть поисковый запрос, фильтруем контакты по имени или фамилии
    if (query) {
        contacts = matchSorter(contacts, query, {keys: ["first", "last"]});
    }

    // Сортируем контакты по фамилии и дате создания
    return contacts.sort(sortBy("last", "createdAt"));
}

// Асинхронная функция для создания нового контакта
export async function createContact() {
    // Имитация сетевого запроса
    await fakeNetwork();

    // Генерируем уникальный ID для нового контакта
    let id = Math.random().toString(36).substring(2, 9);

    // Создаем новый контакт с текущей датой создания
    let contact = {id, createdAt: Date.now()};

    // Получаем текущий список контактов
    let contacts = await getContacts();

    // Добавляем новый контакт в начало списка
    contacts.unshift(contact);

    // Сохраняем обновленный список контактов
    await set(contacts);

    // Возвращаем созданный контакт
    return contact;
}

// Асинхронная функция для получения конкретного контакта по ID
export async function getContact(id) {
    // Имитация сетевого запроса
    await fakeNetwork(`contact:${id}`)    ;

    // Получаем все контакты из локального хранилища
    let contacts = await localforage.getItem("contacts");

    // Ищем контакт по ID
    let contact = contacts.find(contact => contact.id === id);

    // Возвращаем найденный контакт или null, если не найден
    return contact ?? null;
}

// Асинхронная функция для обновления существующего контакта
export async function updateContact(id, updates) {
    // Имитация сетевого запроса
    await fakeNetwork();

    // Получаем все контакты из локального хранилища
    let contacts = await localforage.getItem("contacts");

    // Ищем контакт по ID
    let contact = contacts.find(contact => contact.id === id);

    // Если контакт не найден, выбрасываем ошибку
    if (!contact) throw new Error("No contact found for", id);

    // Обновляем свойства контакта с помощью переданных обновлений
    Object.assign(contact, updates);

    // Сохраняем обновленный список контактов
    await set(contacts);

    // Возвращаем обновленный контакт
    return contact;
}

// Асинхронная функция для удаления контакта по ID
export async function deleteContact(id) {
    // Получаем все контакты из локального хранилища
    let contacts = await localforage.getItem("contacts");

    // Находим индекс контакта по ID
    let index = contacts.findIndex(contact => contact.id === id);

    // Если контакт найден, удаляем его из массива
    if (index > -1) {
        contacts.splice(index, 1); // Удаляем контакт по индексу
        await set(contacts); // Сохраняем обновленный список контактов
        return true; // Возвращаем true, если удаление прошло успешно
    }

    return false; // Возвращаем false, если контакт не найден
}

// Функция для сохранения списка контактов в локальное хранилище
function set(contacts) {
    return localforage.setItem("contacts", contacts);
}

// Имитация кэша для предотвращения замедления повторных запросов
let fakeCache = {};

// Асинхронная функция для имитации сетевого запроса с задержкой
async function fakeNetwork(key) {
    if (!key) {
        fakeCache = {}; // Сбрасываем кэш, если ключ не задан
    }
    if (fakeCache[key]) {
        return; // Если запрос уже был выполнен, ничего не делаем
    }

    fakeCache[key] = true; // Запоминаем, что запрос был выполнен

    return new Promise(res => {
        setTimeout(res, Math.random() * 800); // Задержка от 0 до 800 мс перед выполнением
    });
}