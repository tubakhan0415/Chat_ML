class Chatbox {
  constructor() {
    this.args = {
      openButton: document.querySelector(".chatbox__button"),
      chatBox: document.querySelector(".chatbox__support"),
      sendButton: document.querySelector(".send__button"),
      modeButton: document.querySelector(".mode__button"),
    };

    this.state = false;
    this.messages = [];
    this.mode = "chat";
    this.step = 1;
    this.profession = "";
    this.experience = 0;
    this.cibilScore = false;
    this.totalSalary = 0;
    this.totalObligation = 0;
    this.selectedBank = "";
    this.loanType = null;
    this.businessLoanParameter = null;
    this.balanceDates = [];
    this.currentPrompt = null;
    this.history = [];

    this.initEvents();
    this.init();
  }

  initEvents() {
    const { openButton, chatBox, sendButton, modeButton } = this.args;

    openButton.addEventListener("click", () => this.toggleState(chatBox));
    sendButton.addEventListener("click", () => this.onSendButton());
    modeButton.addEventListener("click", () => this.toggleMode());

    const node = chatBox.querySelector("input");
    node.addEventListener("keyup", ({ key }) => {
      if (key === "Enter") {
        this.onSendButton();
      }
    });
  }

  init() {
    this.args.chatBox.classList.remove("chatbox--active");
  }

  switchToChatMode() {
    this.mode = "chat";
    this.messages.push({
      name: "System",
      alignment: "left",
      message: "How can I assist you?",
    });
    this.updateChatText(this.args.chatBox);
  }

  toggleState(chatbox) {
    this.state = !this.state;
    chatbox.classList.toggle("chatbox--active", this.state);
  }

  toggleMode() {
    this.history.push({
      mode: this.mode,
      step: this.step,
      loanType: this.loanType,
    });
    switch (this.mode) {
      case "chat":
        this.mode = "calculator";
        this.messages.push({
          name: "System",
          alignment: "right",
          message:
            "Calculator mode. Choose 'personal', 'professional', 'business', 'emi', or 'average balance'.",
        });
        break;
      case "calculator":
        this.mode = "emi";
        this.promptForEmiDetails();
        break;
      case "average balance":
        this.mode = "averageBalance";
        this.promptForAverageBalance();
        break;
      default:
        this.mode = "chat";
        this.messages.push({
          name: "System",
          alignment: "left",
          message: "Chat mode. How can I assist you?",
        });
        this.resetCalculatorMode();
    }
    this.updateChatText(this.args.chatBox);
  }

  onSendButton() {
    const textField = this.args.chatBox.querySelector("input");
    const text = textField.value.trim();
    if (!text) return;

    this.history.push({
      mode: this.mode,
      step: this.step,
      loanType: this.loanType,
    });
    this.messages.push({ name: "User", alignment: "right", message: text });

    if (this.mode === "chat") {
      this.fetchChatResponse(text);
    } else if (this.mode === "emi") {
      this.handleEmiMode(text);
    } else if (this.mode === "average balance") {
      this.handleAverageBalanceMode(text);
    } else {
      this.handleCalculatorMode(text);
    }
    textField.value = "";
    this.updateChatText(this.args.chatBox);
  }

  fetchChatResponse(text) {
    fetch("http://3.110.30.178:5000/predict", {
      method: "POST",
      body: JSON.stringify({ message: text }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        this.messages.push({
          name: "Bot",
          alignment: "left",
          message: data.answer,
        });
        this.updateChatText(this.args.chatBox);
      })
      .catch((error) => {
        console.error("Error:", error);
        this.messages.push({
          name: "Bot",
          alignment: "left",
          message: "Sorry, there was a problem. Please try again later.",
        });
        this.updateChatText(this.args.chatBox);
      });
  }

  handleInputBasedOnMode(text) {
    if (this.mode === "chat") {
      this.fetchChatResponse(text);
    } else {
      // Delegate to specific handler based on loanType
      switch (this.loanType) {
        case "personal":
          this.handlePersonalLoanMode(text);
          break;
        case "professional":
          this.handleProfessionalLoanMode(text);
          break;
        case "business":
          this.handleBusinessLoanMode(text);
          break;
        case "emi":
          this.handleEmiMode(text);
          break;
        default:
          this.messages.push({
            name: "Bot",
            alignment: "left",
            message: "Please select an option from the menu.",
          });
          break;
      }
    }
  }

  handleCalculatorMode(text) {
    const lowerCaseText = text.toLowerCase();
    if (
      [
        "personal",
        "professional",
        "business",
        "emi",
        "average balance",
      ].includes(lowerCaseText)
    ) {
      this.loanType = lowerCaseText;
      this.mode = "calculator";
      switch (lowerCaseText) {
        case "personal":
          this.promptForPersonalLoan();
          break;
        case "professional":
          this.promptForProfessionalLoan();
          break;
        case "business":
          this.promptForBusinessLoan();
          break;
        case "emi":
          this.promptForEmiDetails();
          break;
        case "average balance":
          this.promptForAverageBalance();
          break;
      }
    } else {
      this.delegateToLoanHandler(text);
    }
  }

  promptForLoanDetails = function (loanType) {
    // Assuming this method is correctly called after bank selection
    if (loanType === "financialProgram") {
      // The code here should correctly handle what's expected next
      // For example, if prompting for business parameters is next:
      this.promptForBusinessParameters();
    }
    // Handle other loan types as needed
  };

  promptForBankSelection() {
    this.messages.push({
      name: "Bot",
      alignment: "left",
      message: "Please select your bank: " + this.generateBankButtonsHTML(),
    });
    this.updateChatText();
  }

  promptForPersonalLoan() {
    this.loanType = "personal";
    this.messages.push({
      name: "Bot",
      alignment: "left",
      message: "Please enter your total salary.",
    });
    this.step = 1;
    this.updateChatText(this.args.chatBox);
  }

  promptForProfessionalLoan() {
    this.loanType = "professional";
    this.mode = "calculator";
    this.messages.push({
      name: "Bot",
      alignment: "left",
      message:
        "Please select your profession: " +
        this.generateProfessionButtonsHTML(),
    });
    this.step = 1;
    this.updateChatText();
  }

  promptForBusinessLoan() {
    this.loanType = "business";
    this.promptForBankSelection();
  }

  promptForBusinessParameters() {
    this.loanType = "business";
    this.messages.push({
      name: "Bot",
      alignment: "left",
      message:
        "Please select a business parameter: " +
        this.generateBusinessParameterButtonsHTML(),
    });
    this.updateChatText(this.args.chatBox);
  }

  promptForEmiDetails() {
    this.loanType = "emi";
    this.mode = "calculator";
    this.messages.push({
      name: "Bot",
      alignment: "left",
      message: "Please enter the loan amount.",
    });
    this.step = 1;
    this.updateChatText();
    this.history.push("emiDetails");
  }

  promptForAverageBalance() {
    this.loanType = "average balance";
    this.mode = "calculator";
    this.step = 1;
    this.updateChatText(this.args.chatBox);
    this.history.push("averageBalance");
    if (this.balanceDates.length < 6) {
      const dates = ["5th", "10th", "15th", "20th", "25th", "30th"];
      this.messages.push({
        name: "Bot",
        alignment: "left",
        message: `Please enter your balance on the ${
          dates[this.balanceDates.length]
        }.`,
      });
    } else {
      this.calculateAverageBalance();
    }
  }

  generateBusinessParameterButtonsHTML() {
    // First, clear existing buttons to prevent duplication.
    const container = document.querySelector(
      ".business-parameter-buttons-container"
    );
    if (container) {
      container.innerHTML = ""; // Clears existing buttons
    }

    // Define your business parameters here
    const parameters = ["turnover", "netprofit", "grossprofit"];
    return parameters
      .map(
        (parameter) =>
          `<button class="business-parameter-button" data-parameter="${parameter}" onclick="window.chatBoxInstance.selectBusinessParameter('${parameter}')">${parameter}</button>`
      )
      .join("");
  }

  selectBusinessParameter(selectedParameter) {
    if (this.businessLoanParameter === selectedParameter) {
      console.log(`Parameter ${selectedParameter} is already selected.`);
      return;
    }
    this.businessLoanParameter = selectedParameter;
    this.messages.push({
      name: "Bot",
      alignment: "left",
      message: `You've selected ${selectedParameter}. Please enter the amount:`,
    });
    this.step = 2;
    this.updateChatText(this.args.chatBox);
  }

  selectLoan(hasLoan) {
    this.cibilScore = hasLoan === "yes";
    if (this.loanType === "professional") {
      this.calculateProfessionalLoan();
    }
    this.updateChatText(this.args.chatBox);
  }

  delegateToLoanHandler(text) {
    switch (this.loanType) {
      case "personal":
        this.handlePersonalLoanMode(text);
        break;
      case "professional":
        this.handleProfessionalLoanMode(text);
        break;
      case "business":
        this.handleBusinessLoanMode(text);
        break;
      case "emi":
        this.handleEmiMode(text);
        break;
      default:
        this.messages.push({
          name: "Bot",
          alignment: "left",
          message:
            "Please first select a loan type: 'personal', 'professional', or 'business'.",
        });
    }
  }

  handleProfessionalLoanMode(text) {
    switch (this.step) {
      case 1:
        if (
          ["BAMS", "BHMS", "BDS", "MBBS", "MD", "MS"].includes(
            text.toUpperCase()
          )
        ) {
          this.profession = text.toUpperCase();
          this.messages.push({
            name: "System",
            alignment: "left",
            message: "How many years of experience do you have?",
          });
          this.step++;
        } else {
          this.messages.push({
            name: "System",
            alignment: "left",
            message:
              "Please enter a valid profession (BAMS/BHMS/BDS/MBBS/MD/MS):",
          });
        }
        break;
      case 2:
        const experience = parseInt(text, 10);
        if (!isNaN(experience) && experience >= 0) {
          this.experience = experience;
          this.showLoanStatusQuestion();
          this.step++;
        } else {
          this.messages.push({
            name: "System",
            alignment: "left",
            message: "Please enter a valid number for your experience.",
          });
        }
        break;
      case 3:
        break;
      default:
        this.messages.push({
          name: "System",
          alignment: "left",
          message: "There seems to be an error. Please try again.",
        });
        this.step = 1;
        break;
    }
    this.updateChatText(this.args.chatBox);
  }

  handlePersonalLoanMode(text) {
    switch (this.step) {
      case 1:
        const totalSalary = parseFloat(text);
        if (!isNaN(totalSalary) && totalSalary > 0) {
          this.totalSalary = totalSalary;
          this.messages.push({
            name: "System",
            alignment: "right",
            message:
              "Please enter your monthly obligations:" +
              "<button onclick='window.chatBoxInstance.handlePersonalLoanModeBack(1)'>Go Back</button>",
          });
          this.step++;
        } else {
          this.messages.push({
            name: "System",
            alignment: "left",
            message: "Please enter a valid total salary.",
          });
        }
        break;
      case 2:
        const totalObligation = parseFloat(text);
        if (!isNaN(totalObligation) && totalObligation >= 0) {
          this.totalObligation = totalObligation;
          this.messages.push({
            name: "System",
            alignment: "left",
            message:
              "Select your bank for the loan:" +
              this.generateBankButtonsHTML() +
              "<button onclick='window.chatBoxInstance.handlePersonalLoanModeBack(2)'>Go Back</button>",
          });
          this.step++;
        } else {
          this.messages.push({
            name: "System",
            alignment: "left",
            message: "Please enter a valid total obligation.",
          });
        }
        break;
      case 3:
        if (Object.keys(bankFoirMapping).includes(text.toUpperCase())) {
          this.selectedBank = text.toUpperCase();
          this.calculatePersonalLoan();
          this.step = 1;
          this.mode = "chat";
        } else {
          this.messages.push({
            name: "System-left",
            alignment: "left",
            message:
              "Please choose a valid bank from the provided options." +
              "<button onclick='window.chatBoxInstance.handlePersonalLoanModeBack(3)'>Go Back</button>",
          });
        }
        break;
      default:
        this.messages.push({
          name: "System-left",
          alignment: "left",
          message: "There seems to be an error. Please try again.",
        });
        this.step = 1;
    }
    this.updateChatText(this.args.chatBox);
  }

  handlePersonalLoanMode(text) {
    switch (this.step) {
      case 1:
        const totalSalary = parseFloat(text);
        if (!isNaN(totalSalary) && totalSalary > 0) {
          this.totalSalary = totalSalary;
          this.messages.push({
            name: "System",
            alignment: "right",
            message: "Please enter your monthly obligations:",
          });
          this.step++;
        } else {
          this.messages.push({
            name: "System",
            alignment: "left",
            message: "Please enter a valid total salary.",
          });
        }
        break;
      case 2:
        const totalObligation = parseFloat(text);
        if (!isNaN(totalObligation) && totalObligation >= 0) {
          this.totalObligation = totalObligation;
          this.calculatePersonalLoan();
          this.step = 1;
          this.mode = "chat";
        } else {
          this.messages.push({
            name: "System",
            alignment: "left",
            message: "Please enter a valid total obligation.",
          });
        }
        break;
      default:
        this.messages.push({
          name: "System-left",
          alignment: "left",
          message: "There seems to be an error. Please try again.",
        });
        this.step = 1;
    }
    this.updateChatText(this.args.chatBox);
  }

  handleBusinessLoanMode(text) {
    // Handle input based on the current step
    if (this.step === 2) {
      // Expecting to receive either just the amount or both amount and obligations separated by a comma
      let inputs = text.split(",").map((val) => parseFloat(val.trim()));
      let [amount, obligations] =
        inputs.length === 2 ? inputs : [inputs[0], undefined];

      // Store the amount as an instance variable for future use
      this.amount = amount; // Ensure amount is stored correctly

      if (!isNaN(this.amount)) {
        if (obligations === undefined) {
          // If obligations were not provided, prompt the user for it
          this.messages.push({
            name: "Bot",
            alignment: "left",
            message: "Please enter the monthly obligations.",
          });
          this.step++; // Increment step to indicate we're now expecting obligations
        } else {
          // If both amount and obligations were provided, proceed to calculation
          this.calculateBusinessLoan(this.amount, obligations);
          // Reset for next input
          this.resetBusinessLoanProcess();
        }
      } else {
        // If the amount is not a valid number, prompt again
        this.messages.push({
          name: "Bot",
          alignment: "left",
          message: "Invalid amount. Please enter a valid amount.",
        });
      }
    } else if (this.step === 3) {
      // Step 3: Expecting obligations after the amount has already been provided
      const obligations = parseFloat(text);
      if (!isNaN(obligations)) {
        // Use the stored amount and provided obligations to calculate the business loan
        this.calculateBusinessLoan(this.amount, obligations);
        // Reset for next input
        this.resetBusinessLoanProcess();
      } else {
        // If obligations input is not valid, prompt again
        this.messages.push({
          name: "Bot",
          alignment: "left",
          message: "Invalid obligations input. Please enter a valid number.",
        });
      }
    }
    this.updateChatText(); // Update the chat with the new message
  }

  handleEmiMode(text) {
    switch (this.step) {
      case 1:
        this.loanAmount = parseFloat(text);
        this.messages.push({
          name: "System",
          alignment: "left",
          message: "Please enter the annual interest rate (%).",
        });
        this.step++;
        break;
      case 2:
        this.interestRate = parseFloat(text) / 1200;
        this.messages.push({
          name: "System",
          alignment: "left",
          message: "Please enter the loan tenure (in years).",
        });
        this.step++;
        break;
      case 3:
        this.loanTenure = parseInt(text) * 12;
        this.calculateEmi();
        this.step = 1;
        this.mode = "chat";
        break;
    }
    this.updateChatText(this.args.chatBox);
  }

  handleAverageBalanceMode(text) {
    const balance = parseFloat(text);
    if (!isNaN(balance) && balance >= 0) {
      this.balanceDates.push(balance);
      this.promptForAverageBalance();
    } else {
      this.messages.push({
        name: "Bot",
        alignment: "left",
        message: "Please enter a valid balance amount.",
      });
      this.promptForAverageBalance();
    }
    this.updateChatText(this.args.chatBox);
  }

  sendMessageToUser(message) {
    this.messages.push({ name: "System", alignment: "left", message: message });
    this.updateChatText(this.args.chatBox);
  }

  promptForLoanType() {
    this.loanType = null;
    this.messages.push({
      name: "Bot",
      alignment: "left",
      message: "Please select a loan type again.",
    });
  }

  generateBankButtonsHTML() {
    let banks;
    if (this.loanType === "business") {
      banks = ["HDFC", "ICICI", "BAJAJ"];
    } else {
      banks = Object.keys(bankFoirMapping);
    }
    console.log(`Generating bank buttons for loan type: ${this.loanType}`);
    return banks
      .map(
        (bank) =>
          `<button class="bank-button" onclick="window.chatBoxInstance.selectBank('${bank}')">${bank}</button>`
      )
      .join("");
  }

  selectBank(selectedBank) {
    console.log(
      `Bank selected: ${selectedBank}, Current Loan Type: ${this.loanType}`
    );
    if (!this.loanType) {
      console.log("No loan type set. Defaulting to personal loan.");
      this.loanType = "personal";
    }
    this.selectedBank = selectedBank;

    switch (this.loanType) {
      case "business":
        this.promptForBusinessParameters();
        break;
      case "personal":
        this.calculatePersonalLoan();
        break;
      default:
        console.log(
          "Handle other loan types or errors, current loanType:",
          this.loanType
        );
        this.messages.push({
          name: "System",
          alignment: "left",
          message:
            "An error occurred. Please select a loan type before selecting a bank.",
        });
        this.updateChatText(this.args.chatBox);
        break;
    }
  }

  selectBusinessParameter(selectedParameter) {
    // Check if we're already showing the prompt for this parameter to avoid duplication.
    if (this.currentPrompt === selectedParameter) {
      return; // Do nothing if we're already on this prompt.
    }
    this.currentPrompt = selectedParameter; // Update the current prompt.
    //Your existing code to show the prompt...
    this.messages.push({
      name: "Bot",
      alignment: "left",
      message: `You've chosen ${selectedParameter}. Please enter the ${selectedParameter} amount followed by monthly obligations, separated by a comma (e.g., 500000,5000).`,
    });
    //this.updateChatText(this.args.chatBox);
  }

  // Reset currentPrompt when necessary, for example, when switching modes or completing an action.
  resetPrompt() {
    this.currentPrompt = null;
  }

  // New method to generate profession buttons HTML
  generateProfessionButtonsHTML() {
    const professions = ["BAMS", "BHMS", "BDS", "MBBS", "MD", "MS", "MDS"];
    return professions
      .map(
        (profession) =>
          `<button class="profession-button" data-profession="${profession}" onclick="window.chatBoxInstance.selectProfession('${profession}')">${profession}</button>`
      )
      .join("");
  }

  showLoanStatusQuestion() {
    // Method to display loan status question with Yes/No buttons
    this.messages.push({
      name: "Bot",
      alignment: "left",
      message: `<div id="loanStatusQuestion">
                        <p>Are you currently running any loan?</p>
                        <button class="loan-button" data-loan="yes" onclick="window.chatBoxInstance.selectLoan('yes')">Yes</button>
                        <button class="loan-button" data-loan="no" onclick="window.chatBoxInstance.selectLoan('no')">No</button>
                      </div>`,
    });
    this.updateChatText(this.args.chatBox);
  }

  // New method to handle profession selection
  selectProfession(selectedProfession) {
    this.profession = selectedProfession;
    // Ask the next question based on the profession selection
    this.messages.push({
      name: "System",
      alignment: "left",
      message: "How many years of experience do you have?",
    });
    this.step++; // Move to the next step
    this.updateChatText(this.args.chatBox);
  }

  generateLoanButtonsHTML() {
    return `
            <button class="loan-button" onclick="window.chatBoxInstance.selectLoan('yes')">Yes</button>
            <button class="loan-button" onclick="window.chatBoxInstance.selectLoan('no')">No</button>
        `;
  }

  selectLoan(hasLoan) {
    this.hasRunningLoan = hasLoan === "yes";
    // Now, adjust your logic based on this correct state
    this.calculateProfessionalLoan();
    this.updateChatText(this.args.chatBox);
  }

  // New method to handle profession selection
  selectProfession(selectedProfession) {
    this.profession = selectedProfession;
    // Ask the next question based on the profession selection
    this.messages.push({
      name: "System",
      alignment: "left",
      message: "How many years of experience do you have?",
    });
    this.step++; // Move to the next step
    this.updateChatText(this.args.chatBox);
  }

  selectBusinessParameter(selectedParameter) {
    this.businessLoanParameter = selectedParameter;
    // Log to console to verify that the method is called
    console.log(`Business parameter selected: ${selectedParameter}`);
    this.messages.push({
      name: "Bot",
      alignment: "left",
      message: `You've selected ${selectedParameter}. Please enter the amount:`,
    });
    this.step = 2; // Assuming step 2 is where you enter the amount for the selected parameter
    this.updateChatText(this.args.chatBox);
  }

  calculateProfessionalLoan() {
    let baseEligibilityAmount = 0;

    if (this.hasRunningLoan) {
      switch (this.profession) {
        case "BAMS":
        case "BHMS":
        case "BDS":
          baseEligibilityAmount = 0;
          break;
        case "MBBS":
          if (this.experience <= 2) {
            baseEligibilityAmount = 500000 / 2;
          } else if (this.experience === 3) {
            baseEligibilityAmount = 600000 / 2;
          } else if (this.experience > 3 && this.experience <= 10) {
            baseEligibilityAmount = (this.experience * 200000) / 2;
          } else if (this.experience >= 11 && this.experience <= 14) {
            baseEligibilityAmount = 3000000 / 2;
          } else if (this.experience >= 15) {
            baseEligibilityAmount = 3500000 / 2;
          }
          break;
        case "MD":
        case "MS":
          if (this.experience <= 3) {
            baseEligibilityAmount = 3500000 / 2;
          } else if (this.experience <= 5) {
            baseEligibilityAmount = 4000000 / 2;
          } else {
            baseEligibilityAmount = 5000000 / 2;
          }
          break;
        case "MDS":
          baseEligibilityAmount = 0;
          break;
      }
    } else {
      switch (this.profession) {
        case "BAMS":
        case "BHMS":
        case "BDS":
          if (this.experience >= 3 && this.experience <= 14) {
            baseEligibilityAmount = this.experience * 100000;
          } else if (this.experience > 14) {
            baseEligibilityAmount = 1500000;
          }
          break;
        case "MBBS":
          if (this.experience <= 2) {
            baseEligibilityAmount = 500000;
          } else if (this.experience === 3) {
            baseEligibilityAmount = 600000;
          } else if (this.experience > 3 && this.experience <= 10) {
            baseEligibilityAmount = this.experience * 200000;
          } else if (this.experience >= 11 && this.experience <= 14) {
            baseEligibilityAmount = 3000000;
          } else if (this.experience >= 15) {
            baseEligibilityAmount = 3500000;
          }
          break;
        case "MD":
        case "MS":
          if (this.experience <= 3) {
            baseEligibilityAmount = 3500000;
          } else if (this.experience <= 5) {
            baseEligibilityAmount = 4000000;
          } else {
            baseEligibilityAmount = 5000000;
          }
          break;
        case "MDS":
          if (this.experience <= 2) {
            baseEligibilityAmount = 750000;
          } else if (this.experience <= 4) {
            baseEligibilityAmount = 1500000;
          } else if (this.experience <= 9) {
            baseEligibilityAmount = 2000000;
          } else if (this.experience >= 10) {
            baseEligibilityAmount = 2500000;
          }
          break;
        default:
          baseEligibilityAmount = 0;
          break;
      }
    }

    baseEligibilityAmount = Math.min(baseEligibilityAmount, 5000000);

    this.messages.push({
      name: "System",
      alignment: "left",
      message: `Based on the information provided, your eligibility amount for a professional loan is: ${baseEligibilityAmount.toLocaleString()}.`,
    });

    this.updateChatText(this.args.chatBox);
  }

  calculatePersonalLoan() {
    const totalSalary = parseFloat(this.totalSalary);
    const totalObligation = parseFloat(this.totalObligation);

    let foir = 0;

    if (totalSalary > 100000) {
      foir = 70;
    } else if (totalSalary >= 60000) {
      foir = 65;
    } else if (totalSalary >= 50000) {
      foir = 60;
    } else if (totalSalary >= 40000) {
      foir = 55;
    } else {
      foir = 50;
    }

    let eligibilityAmount = ((foir / 100) * totalSalary - totalObligation) * 50;
    eligibilityAmount = Math.min(eligibilityAmount, 4000000);
    eligibilityAmount = Math.max(0, eligibilityAmount);

    this.messages.push({
      name: "System",
      alignment: "left",
      message: `Eligibility Amount for Personal Loan: ${eligibilityAmount.toLocaleString()}`,
    });

    this.updateChatText(this.args.chatBox);
    this.resetCalculatorMode();
  }

  calculateBusinessLoan(amount, obligations) {
    let eligibilityAmount = 0;
    const bankMultipliers = {
      HDFC: { turnover: 0.1, netprofit: 4, grossprofit: 2 },
      ICICI: { turnover: 0.1, netprofit: 4, grossprofit: 2 },
      BAJAJ: { turnover: 0.1, netprofit: 4, grossprofit: 2 },
    };
    const multipliers = bankMultipliers[this.selectedBank];

    switch (this.businessLoanParameter) {
      case "turnover":
        eligibilityAmount =
          (amount * (multipliers.turnover / 12) - obligations) * 50;
        break;
      case "netprofit":
        eligibilityAmount = amount * multipliers.netprofit - obligations * 12;
        break;
      case "grossprofit":
        eligibilityAmount = amount * multipliers.grossprofit - obligations * 12;
        break;
      default:
        this.messages.push({
          name: "Bot",
          message: "An error occurred. Please start over.",
        });
        return;
    }

    // Cap the loan amount at 7,500,000 if it exceeds this value
    if (eligibilityAmount > 7500000) {
      eligibilityAmount = 7500000;
    } else if (eligibilityAmount < 300000) {
      eligibilityAmount = 300000;
    }

    // Ensure eligibilityAmount is not negative
    eligibilityAmount = Math.max(0, eligibilityAmount);

    this.messages.push({
      name: "Bot",
      alignment: "left",
      message: `Based on the information provided, your eligibility amount for a business loan with ${
        this.selectedBank
      } is: ${eligibilityAmount.toLocaleString()}.`,
    });
    this.updateChatText();
  }

  resetBusinessLoanProcess() {
    this.amount = null;
    this.step = 1;
    this.mode = "chat";
  }

  calculateEmi() {
    const emi =
      this.loanAmount *
      this.interestRate *
      (Math.pow(1 + this.interestRate, this.loanTenure) /
        (Math.pow(1 + this.interestRate, this.loanTenure) - 1));
    this.messages.push({
      name: "System",
      message: `Your monthly EMI is: ${emi.toFixed(2)}.`,
    });
  }

  calculateAverageBalance() {
    const averageBalance =
      this.balanceDates.reduce((acc, curr) => acc + curr, 0) /
      this.balanceDates.length;
    this.messages.push({
      name: "Bot",
      message: `Your average balance is: ${averageBalance.toFixed(2)}.`,
    });
    this.mode = "chat";
    this.balanceDates = [];
    this.updateChatText(this.args.chatBox);
  }

  resetCalculatorMode(resetLoanType = false) {
    console.log("Resetting calculator mode. Current state:", this.loanType);

    this.businessLoanParameter = null;
    this.currentPrompt = null;

    if (resetLoanType) {
      this.loanType = null;
      console.log("Loan type has been reset");
    }

    this.updateChatText();
  }

  updateChatText() {
    const chatMessages = this.args.chatBox.querySelector(".chatbox__messages");
    let html = this.messages
      .slice()
      .reverse()
      .map((item) => {
        const alignmentClass =
          item.alignment === "left"
            ? "messages__item--left"
            : "messages__item--right";
        return `<div class="messages__item ${alignmentClass}">${item.message}</div>`;
      })
      .join("");
    chatMessages.innerHTML = html;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  evaluateScripts() {
    const scripts = this.args.chatBox.querySelectorAll(
      ".chatbox__messages script"
    );
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      Array.from(script.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      if (script.textContent) {
        newScript.textContent = script.textContent;
      }
      script.parentNode.replaceChild(newScript, script);
    });
  }
}

export default Chatbox;
