var DataManager = (function() {

    var metaInfo = {};

    this.newMetaInfo = function() {
        metaInfo.distance = 0;
        metaInfo.duration = 0;
        metaInfo.distanceUnit = "m";
        metaInfo.durationUnit = "secs";
        return metaInfo;
    };

    this.addDistance = function(newDistance) {
        metaInfo.distance += newDistance;
    };
    this.addDuration = function(newDuration) {
        metaInfo.duration += newDuration;
    };

    this.updateMetaInfoText = function() {
        var distanceKm = metaInfo.distance / 1000;
        if(distanceKm > 1) {
            metaInfo.distanceText = distanceKm + "km ";
        } else {
            metaInfo.distanceText = metaInfo.distance + "m";
        }

        var durationMinutes = metaInfo.duration / 60;
        var durationSeconds = metaInfo.duration % 60;
        if (durationMinutes > 1) {
            if (durationMinutes < 60) {
                metaInfo.durationText = Math.floor(durationMinutes) + "." + durationSeconds;
            } else {
                var durationHours = durationMinutes / 60;
                durationMinutes = durationMinutes % 60;
                metaInfo.durationText = Math.floor(durationHours) + ":" + Math.floor(durationMinutes);
            }
        } else {
            metaInfo.durationText = metaInfo.duration + " secs";
        }
        updateDataInfo(metaInfo);
    };

    var updateDataInfo = function(metaInfo) {
        var totalDistanceElement = document.getElementById('total-distance');
        var totalDurationElement = document.getElementById('total-duration');

        totalDistanceElement.innerHTML = metaInfo.distanceText;
        totalDurationElement.innerHTML = metaInfo.durationText;
    };
    return this;
})();