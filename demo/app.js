var dataLayer = [];
; (function(angular) {

    angular.module( 'gtmLogger.demo', ['GTMLogger'] )

    .config( function( GTMLoggerProvider ) {

        GTMLoggerProvider
            .includeTimestamp( true )
            .includeUrl( true )
            .sendConsoleErrors(true)
            .logToConsole(true)
        ;

    } )

    .controller( 'MainCtrl', function( $scope, $log, GTMLogger) {

        $scope.inputToken = null;
        $scope.message = '';
        $scope.extra = '{}';

        //We can also create named loggers, similar to log4j
        var megaLog = $log.getLogger( 'ExtraLogger' );

        $scope.updateExtra = function() {
          GTMLogger.fields( angular.fromJson( $scope.extra ) );
        };

        $scope.logIt = function() {
            $log.info( {'message': $scope.message, 'data': {}});
        };

        $scope.megaLogIt = function() {
            megaLog.warn( {'message': $scope.message, 'data': {}} );
        };

    })


    ;


})(window.angular);
