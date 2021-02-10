const Modal = {
  // Modal que é ativado ao clicar em "Nova transação"
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },

  // O mesmo modal se fecha ao clicar em "Cancelar"
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },

  set(transactions) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
    );
  },
};

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);

    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    let income = 0;
    // Pegar todas as transações e para cada transação,
    Transaction.all.forEach((transaction) => {
      // se ela for maior que 0,
      if (transaction.amount > 0) {
        // somar a uma variável e
        income += transaction.amount;
      }
    });
    // retornar essa variável
    return income;
  },

  expenses() {
    let expense = 0;
    // Pegar todas as transações,
    // para cada transação,
    Transaction.all.forEach((transaction) => {
      // se ela for maior que 0,
      if (transaction.amount < 0) {
        // somar a uma variável
        expense += transaction.amount;
      }
    });
    // e retornar essa variável
    return expense;
  },

  total() {
    // Soma das entradas e saídas de dinheiro. É uma soma e não uma subtração pois as saídas já possuem um valor negativo.
    return Transaction.incomes() + Transaction.expenses();
  },
};

const DOM = {
  // Selecionando um elemento diretamente do HTML
  transactionsContainer: document.querySelector("#data-table tbody"),

  // Criando uma função que irá criar uma tabela (tr) e adicionando a função transaction nessa tabela.
  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="Remover transação">
        </td>
        `;

    return html;
  },

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100;

    return Math.round(value);
  },

  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  // Formatação de um número para um tipo de moeda (BRL)
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos.");
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    // Tirar o funcionamento padrão
    event.preventDefault();

    try {
      // Verificar se todas as informações foram preenchidas,
      Form.validateFields();
      // formatar os dados para salvar,
      const transaction = Form.formatValues();
      // salvar,
      Transaction.add(transaction);
      // apagar os dados do formulário e
      Form.clearFields();
      // fechar o modal e Atualizar a aplicação
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);

    // Retorno da função updateBalance (DOM)
    DOM.updateBalance();

    Storage.set(Transaction.all);
  },

  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
