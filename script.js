document.getElementById('modForm').addEventListener('submit', function(e) {
    // Voorkom dat de pagina herlaadt
    e.preventDefault();

    // Haal de ingevulde waarden op (handig als je dit ooit nog naar een anonieme API wilt loggen)
    const gekozenConsole = document.getElementById('console').value;
    const opmerking = document.getElementById('msg').value;

    // Verberg het invoerformulier
    document.getElementById('modForm').classList.add('hidden');

    // Toon de verborgen succesbox met de anonieme Telegram link
    const successBox = document.getElementById('successMessage');
    successBox.classList.remove('hidden');
    
    // Scroll automatisch soepel naar de geopende succesbox
    successBox.scrollIntoView({ behavior: 'smooth' });
});
