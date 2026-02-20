
document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('.settings-button');
    const menu = document.querySelector('.settings-menu');
    
    button.addEventListener('click', function() {
        menu.classList.toggle('active');
    });
    
    // Закрытие при клике вне меню (опционально)
    document.addEventListener('click', function(event) {
        if (!button.contains(event.target) && !menu.contains(event.target)) {
            menu.classList.remove('active');
        }
    });
});
