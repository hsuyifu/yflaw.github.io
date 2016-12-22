(function () {
    var hero = document.getElementById('fpHero');
    var img = hero.getElementsByTagName('img')[0];

    var posY = window.pageYOffset;
    var moveRange = 50;
    var moveIndex = 0.15;
    var windowWidth = window.innerWidth;
    var getParallex = function (posY, moveIndex, moveRange) {
        var distance = (posY * moveIndex)  - moveRange;
        return distance;
    };
    if (hero && windowWidth > 737) {
        window.addEventListener('scroll', function () {
            posY = window.pageYOffset;
            img.style.top = getParallex(posY, moveIndex, moveRange) + 'px';
        });
        img.style.top = getParallex(posY, moveIndex, moveRange) + 'px';
    }
})();