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

    this.updateInnerInfo = function(marker) {
        var distanceText = generateDistanceText(marker.pathToNextMarker.data.distance);
        var durationText = generateDurationText(marker.pathToNextMarker.data.duration);

        marker.pathMetaInfoElement.html(distanceText + "<span class='down-arrow-icon'></span>" + durationText);
    };

    var generateDurationText = function(duration) {
        var durationText;
        var durationMinutes = duration / 60;
        var durationSeconds = duration % 60;
        if (durationMinutes > 1) {
            if (durationMinutes < 60) {
                durationText = Math.floor(durationMinutes) + "." + durationSeconds;
            } else {
                var durationHours = durationMinutes / 60;
                durationMinutes = durationMinutes % 60;
                durationText = Math.floor(durationHours) + ":" + Math.floor(durationMinutes);
            }
        } else {
            durationText = duration + " secs";
        }
        return durationText;
    };

    var generateDistanceText = function(distance) {
        var distanceText;
        var distanceKm = distance / 1000;
        if(distanceKm > 1) {
            distanceText = distanceKm + "km ";
        } else {
            distanceText = metaInfo.distance + "m";
        }
        return distanceText;
    };

    this.updateMetaInfoText = function() {
        metaInfo.distanceText = generateDistanceText(metaInfo.distance);
        metaInfo.durationText = generateDurationText(metaInfo.duration);
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