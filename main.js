//? json-server -w db.json -p 8000

//? АПИ для запросов
const API = "http://localhost:8000/products";

//? блок куда мы добавляем карточки
const list = document.querySelector("#products-list");
//? форма с инпутами для ввода данных
const addForm = document.querySelector("#add-form");
const titleInp = document.querySelector("#title");
const priceInp = document.querySelector("#price");
const descriptionInp = document.querySelector("#description");
const imageInp = document.querySelector("#image");
const editImageInp = document.querySelector("#edit-image");
const editSaveBtn = document.querySelector("#btn-save-edit");
const searchInp = document.querySelector("#search");

const paginationList = document.querySelector(".pagination-list");
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
const ohayou = 0;
//? инпуты и кнопка из модалки
const editTitleInp = document.querySelector("#edit-title");
const editPriceInp = document.querySelector("#edit-price");
const editDescriptionInp = document.querySelector("#edit-descr");

let searchVal = "";
const limit = 3;
let currentPage = 1;
let pageTotalCount = 1;

//? первоначальное отображение данных
getProducts();

//? Стягиваем данные с сервера
async function getProducts() {
  const res = await fetch(
    `${API}?title_like=${searchVal}&_limit=${limit}&_page=${currentPage}`
  );

  const count = res.headers.get("x-total-count");
  pageTotalCount = Math.ceil(count / limit);
  const data = await res.json(); // ? расшивровка данных
  //? отображаем актуальные данные
  render(data);
}
//? функция для добавления в db.json

async function addProducts(product) {
  //? await для того чтобы getProducts подождал пока данные добавятся
  await fetch(API, {
    method: "POST",
    body: JSON.stringify(product),
    headers: {
      "Content-Type": "application/json",
    },
  });
  //? стянуть и отоброзить актуальные данные
  getProducts();
}

//? функция для удаления из db.json
async function deleteProduct(id) {
  //? await для того чтобы getProducts подождал пока данные удалятся
  await fetch(`${API}/${id}`, {
    method: "DELETE",
  });
  //? стянуть и отоброзить актуальные данные
  getProducts();
}

//? функция для получения одного продукта
async function getOneProduct(id) {
  const res = await fetch(`${API}/${id}`);
  const data = await res.json(); // ? расшифровка данных
  return data; //? возвращаем продукт с db.json
}

//? функция чтобы изменить данные
async function editProduct(id, editedProduct) {
  await fetch(`${API}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(editedProduct),
    headers: {
      "Content-Type": "application/json",
    },
  });
  getProducts();
}

//? отображаем на странице
function render(arr) {
  //? очищаем чтобы карточки не дублировались
  list.innerHTML = "";
  arr.forEach((item) => {
    list.innerHTML += `
		<div class="card m-5" style="width: 18rem">
			<img
				src="${item.image}"
				class="card-img-top w-100"
				alt="..."
			/>
			<div class="card-body">
				<h5 class="card-title">${item.title}</h5>
				<p class="card-text">${item.description.slice(0, 70)}...</p>
				<p class="card-text">$ ${item.price}</p>
				<button id="${item.id}" class="btn btn-danger btn-delete">DELETE</button>
				<button data-bs-toggle="modal" data-bs-target="#exampleModal" id="${item.id}" 
				class="btn btn-dark btn-edit">EDIT</button>
			</div>
		</div>`;
  });
  renderPagination();
}

// ? обработчик события для добавления (CREATE)
addForm.addEventListener("submit", (e) => {
  //? чтобы страница не перезагружалась
  e.preventDefault();

  // ? проверка на заполненность полей
  if (
    !titleInp.value.trim() ||
    !priceInp.value.trim() ||
    !descriptionInp.value.trim() ||
    !imageInp.value.trim()
  ) {
    alert("Заполните все поля");
    return;
  }

  //? создаем объект для добавления в db.json
  const product = {
    title: titleInp.value,
    price: priceInp.value,
    description: descriptionInp.value,
    image: imageInp.value,
  };
  //? отправляем объект в db.json
  addProducts(product);

  //? очищаем инпуты
  titleInp.value = "";
  priceInp.value = "";
  descriptionInp.value = "";
  imageInp.value = "";
});

// ? обработчик события для удаления (DELETE)
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete")) {
    deleteProduct(e.target.id);
  }
});

//? переменная чтобы сохранить id продукта на который мы нажали
let id = null;
//? обработчик события на открытие и заполнение модалки
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-edit")) {
    //? сохраняем id продукта
    id = e.target.id;
    //? получаем объект продукта на который мы нажали
    //? await потому что getOneProduct асинхронная функция
    const product = await getOneProduct(e.target.id);

    //? заполняем инпуты данными продукта
    editTitleInp.value = product.title;
    editPriceInp.value = product.price;
    editDescriptionInp.value = product.description;
    editImageInp.value = product.image;
  }
});

//? обработчик события на сохранение данных
editSaveBtn.addEventListener("click", () => {
  //? проверка на пустату инпутов
  if (
    !editTitleInp.value.trim() ||
    !editPriceInp.value.trim() ||
    !editDescriptionInp.value.trim() ||
    !editImageInp.value.trim()
  ) {
    alert("Заполните все поля");
    //? если хотя бы один инпут пустой выводим предупреждение и останавливаем функцию
    return;
  }

  //? собираем измененный объект для изменения продукта
  const editedProduct = {
    title: editTitleInp.value,
    price: editPriceInp.value,
    description: editDescriptionInp.value,
    image: editImageInp.value,
  };
  //? вызываем функцию для изменения
  editProduct(id, editedProduct);
});

searchInp.addEventListener("input", () => {
  searchVal = searchInp.value;
  currentPage = 1;
  getProducts();
});

function renderPagination() {
  paginationList.innerHTML = "";
  for (let i = 1; i <= pageTotalCount; i++) {
    paginationList.innerHTML += `
	<li class="page-item ${currentPage == i ? "active" : ""}">
	<button href="#" class="page-link page_number">${i}</button>
	</li>`;
  }

  if (currentPage == 1) {
    prev.classList.add("disabled");
  } else {
    prev.classList.remove("disabled");
  }

  if (currentPage == pageTotalCount) {
    next.classList.add("disabled");
  } else {
    next.classList.remove("disabled");
  }
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("page_number")) {
    currentPage = e.target.innerText;
    getProducts();
  }
});

next.addEventListener("click", () => {
  if (currentPage == pageTotalCount) {
    return;
  }
  currentPage++;
  getProducts();
});

prev.addEventListener("click", () => {
  if (currentPage == 1) {
    return;
  }
  currentPage--;
  getProducts();
});

console.log("git checkhout(-b)");
