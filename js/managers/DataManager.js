var DataManager = (function() {

    /*
     Big bad method that shows distances and duration.
     */
    this.addTravelDatas = function(leg) {
        var totalDistanceElement = document.getElementById('total-distance');
        var totalDurationElement = document.getElementById('total-duration');
        var totalDistanceUnitElement = document.getElementById('total-distance-unit');
        var totalDurationUnitElement = document.getElementById('total-duration-unit');

        var totalDistance = parseFloat(totalDistanceElement.innerHTML);
        var totalDuration = parseFloat(totalDurationElement.innerHTML);
        var totalDistanceUnit = totalDistanceUnitElement.innerHTML;
        var totalDurationUnit = totalDurationUnitElement.innerHTML;

        var newDistance = leg.distance.value;
        var newDuration = leg.duration.value;

        if (totalDistanceUnit == 'km') {
            newDistance /= 1000;
        }
        switch (totalDurationUnit) {
            case 'hours':
                newDuration /= 3600;
                break;
            case 'mins':
                newDuration /= 60;
                break;
        }

        totalDistance += newDistance;
        totalDuration += newDuration;

        if(totalDistance > 1000) {
            totalDistance /= 1000;
            totalDistanceUnit = "km";
        }
        if(totalDuration > 60 && totalDurationUnit == 'secs') {
            totalDuration /= 60;
            totalDurationUnit = "mins";
        }
        if(totalDuration > 60 && totalDurationUnit == 'mins') {
            totalDuration /= 60;
            totalDurationUnit = "hours";
        }

        totalDistanceElement.innerHTML = totalDistance.toFixed(2);
        totalDurationElement.innerHTML = totalDuration.toFixed(2);
        totalDistanceUnitElement.innerHTML = totalDistanceUnit;
        totalDurationUnitElement.innerHTML = totalDurationUnit;
    };

    return this;
})();