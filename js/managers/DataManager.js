var DataManager = (function() {

    this.updateDataInfo = function(metaInfo) {
        var totalDistanceElement = document.getElementById('total-distance');
        var totalDurationElement = document.getElementById('total-duration');

        totalDistanceElement.innerHTML = metaInfo.distanceText;
        totalDurationElement.innerHTML = metaInfo.durationText;
    };
    return this;
})();