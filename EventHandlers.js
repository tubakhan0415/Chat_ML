import Chatbox from './Chatbox.js';

export function setupEventHandlers(chatBoxInstance) {
    window.showQuestion = function(section) {
        if(section === 'emi') {
            window.chatBoxInstance.promptForEmiDetails();
        } else if (section === 'queries') {
            // Instead of redirecting, switch to chat mode
            window.chatBoxInstance.switchToChatMode();
        } else {
            // Hide all sections first
            $('.chatbox__messages div').hide();
            // Show the selected section
            $('#' + section).show();
        }
};

    window.showEmploymentType = function() {
        $('#employmentType').show();
        console.log("After showing, employmentType visibility: ", $('#employmentType').css('display'));
    };

    window.hideEmploymentType = function() {
        $('#employmentType').hide();
        console.log("After hiding, employmentType visibility: ", $('#employmentType').css('display'));
    };

    window.toggleEmploymentType = function() {
        $('#employmentType').toggle();
        console.log("After toggle, employmentType visibility: ", $('#employmentType').css('display'));
    };

    window.directTo = function(loanType) {
        console.log("Directing to loan type: " + loanType);
        $('.chatbox__messages div').hide();
        switch (loanType) {
            case 'degreeProgram':
                $('#degreeProgram').show();
                break;
            case 'financialProgram':
                $('#financialProgram').show();
                break;
            default:
                console.error('Unhandled loan type: ' + loanType);
                break;
        }
    };
   

   // Add average balance button functionality in showQuestion function
   window.showQuestion = function(section) {
    console.log("Showing section: " + section);
    $('.chatbox__messages div').hide();
    console.log("All sections hidden");
    if(section === 'emi') {
        window.chatBoxInstance.promptForEmiDetails();
    } else if (section === 'averageBalance') {
        window.chatBoxInstance.promptForAverageBalance();
    } else if (section === 'queries') {
        window.chatBoxInstance.switchToChatMode();
    } else {
        $('#' + section).show();
        console.log("Section shown: " + section);
    }
};
    window.showProfessionalOptions = function() {
        console.log("Showing professional options - Start");
        $('.chatbox__messages div').hide();
        $('#employmentType').html(`
            <p>Choose one program:</p>
            <button onclick="directTo('degreeProgram')">Degree Program</button>
            <button onclick="directTo('financialProgram')">Financial Program</button>
            <button onclick="goBackToEmploymentType()">Go Back</button>
        `).show();
        console.log("Showing professional options - End");
    };

    window.goBackToEmploymentType = function() {
        console.log("Going back to employment type options - Start");
        $('.chatbox__messages div').hide();
        $('#employmentType').html(`
            <p>What is your employment type?</p>
            <button onclick="directTo('personal')">Salaried</button>
            <button onclick="showProfessionalOptions()">Self-Employed Professional</button>
            <button onclick="directTo('business')">Self-Employed Non-Professional</button>
            <button onclick="showQuestion('eligibility')">Go Back</button>
        `).show();
        console.log("Going back to employment type options - End");
    };

    window.directTo = function(loanType) {
        chatBoxInstance.loanType = loanType;
        chatBoxInstance.mode = 'calculator';

        if (loanType === 'degreeProgram') {
            chatBoxInstance.promptForProfessionalLoan();
        } else if (loanType === 'financialProgram') {
            chatBoxInstance.promptForBusinessLoan();
        } else {
            chatBoxInstance[`promptFor${loanType.charAt(0).toUpperCase() + loanType.slice(1)}Loan`]();
        }
    };

      // Extend the Chatbox class or its initialization to handle the average balance
      Chatbox.prototype.promptForAverageBalance = function() {
        this.mode = 'average balance'; // Set mode
        this.balanceDates = []; // Reset balance array
        this.step = 1; // Reset step for collecting balances
        this.messages.push({ name: "System", alignment: "left", message: "Please enter your balance on the 5th." });
        this.updateChatText(this.args.chatBox);
    };

    // Modify existing logic to handle average balance input collection
    // Add or modify methods as necessary, for example:
    Chatbox.prototype.handleAverageBalanceMode = function(text) {
        const balance = parseFloat(text);
        if (!isNaN(balance) && balance >= 0) {
            this.balanceDates.push(balance);
            const dates = ["5th", "10th", "15th", "20th", "25th", "30th"];
            if (this.balanceDates.length < 6) {
                this.messages.push({ name: "Bot", alignment: "left", message: `Please enter your balance on the ${dates[this.balanceDates.length]}.` });
            } else {
                this.calculateAverageBalance();
            }
        } else {
            this.messages.push({ name: "Bot", alignment: "left", message: "Please enter a valid balance amount." });
        }
        this.updateChatText(this.args.chatBox);
    };

    // Implement the calculateAverageBalance method
    Chatbox.prototype.calculateAverageBalance = function() {
        const averageBalance = this.balanceDates.reduce((acc, curr) => acc + curr, 0) / this.balanceDates.length;
        this.messages.push({ name: "Bot", alignment: "left", message: `Your average balance is: ${averageBalance.toFixed(2)}.` });
        this.mode = 'chat'; // Reset to chat mode
        this.updateChatText(this.args.chatBox);
    };
   
    Chatbox.prototype.promptForLoanDetails = function(loanType) {
        // Reset any previous state specific to loan details to ensure a fresh start
        this.resetCalculatorMode(); // Example reset method, adjust according to your implementation
    
        // Setting up different questions or steps based on the program
        switch (loanType) {
            case 'financialProgram':
                // Example of setting up for financial program flow
                // Assuming the financialProgram requires bank selection first
                this.messages.push({ name: "Bot", alignment: "left", message: "Please select your bank: " + this.generateBankButtonsHTML()});
                this.updateChatText(); // Make sure the chat is updated with the new message
                // Note: The actual selection of a bank and further steps should be handled
                // in the event listeners for the dynamically added bank selection buttons.
                break;
    
            case 'businessLoan':
                // Prompt for bank selection directly or any initial step specific to business loans
                this.promptForBankSelection();
                break;
    
            case 'personalLoan':
                // Start personal loan flow with specific prompts
                this.promptForPersonalLoan();
                break;
    
            case 'professionalLoan':
                // Start professional loan flow, maybe asking for the profession first
                this.promptForProfessionalLoan();
                break;
    
            default:
                // Handle unexpected loan types or reset to a safe state
                this.messages.push({ name: "Bot", alignment: "left", message: "Please select a valid loan type from the menu." });
                this.updateChatText();
                break;
        }
    };
    
    // Make sure to implement or adjust the `resetCalculatorMode` method to clean up any state specific to previous loan calculations or prompts.
    Chatbox.prototype.resetCalculatorMode = function() {
        // Reset or clear properties related to calculator mode
        this.loanType = null;
        this.businessLoanParameter = null;
        // Add more resets as necessary based on the properties used in your calculator modes
        this.step = 1; // Reset the step to the beginning
        // Clear any specific messages or states if needed
    };
    

    // Initially hide all option groups except for the main questions
    $('.chatbox__messages div').not('#mainQuestion').hide();



    // Initial DOM Ready Setup
    $(document).ready(function() {
        console.log("Event handlers setup complete.");
    });

    document.addEventListener("DOMContentLoaded", () => {
        window.chatBoxInstance = new Chatbox();
    });
    
    $('#bankSelection').hide();
    // Initially hide all option groups except for the main questions
    $('.chatbox__messages div').not('#mainQuestion').hide();
    $('.bank-button').on('click', function() {
        const selectedBank = $(this).attr('data-bank');
        window.chatBoxInstance.selectedBank = selectedBank; // Set the selected bank
        // Now, you can call the function to calculate the loan based on the selected bank
        window.chatBoxInstance.calculatePersonalLoan(); // Example function call
        // Hide the bank selection div and show the next part of the chat
        $('#bankSelection').hide();
        // You may need to manually call updateChatText or similar here, depending on your setup
    });
}
