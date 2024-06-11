import Chatbox from './Chatbox.js';

import { setupEventHandlers } from './EventHandlers.js';

$(document).ready(function() {
    console.log("Document is ready, and jQuery is loaded.");
    const chatBoxInstance = new Chatbox();
    window.chatBoxInstance = chatBoxInstance;
    
    $('#bankSelection').hide();
    $('.chatbox__messages div').not('#mainQuestion').hide();

    // Add event handlers for bank buttons
    $('.bank-button').on('click', function() {
        const selectedBank = $(this).attr('data-bank');
        window.chatBoxInstance.selectBank(selectedBank);
        $('#bankSelection').hide();
        // Call additional functions if needed
        window.chatBoxInstance.calculatePersonalLoan();
    });

    // Setup additional event handlers
    setupEventHandlers(chatBoxInstance);
});