'use strict';

/* jasmine specs for services go here */

describe('GTMLogger Module:', function() {
  var theGTMLoggerProvider,
      dataLayer = [],
      moduleTest = this,
      levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

  beforeEach(function () {
    // Initialize the service provider
    // by injecting it to a fake module's config block
    var fakeModule = angular.module('test.app.config', ['GTMLogger'], function () {});
    fakeModule.config( function(GTMLoggerProvider) {
      theGTMLoggerProvider = GTMLoggerProvider;
    });
    module('GTMLogger.logger', 'test.app.config');

    // Kickstart the injectors previously registered 
    // with calls to angular.mock.module
    inject(function () {});
  });


  describe( 'GTMLoggerProvider', function() {
    it('should be registered', function () {
      expect(theGTMLoggerProvider).not.toBe(undefined);
    });

    it( 'can have a logging level configured', function() {

        for( var i in levels ) {
            theGTMLoggerProvider.level( levels[i] );
            expect( theGTMLoggerProvider.level() ).toEqual( levels[i] );
        }
    });


    it( 'will throw an exception if an invalid level is supplied', function() {

        expect( function() { theGTMLoggerProvider.level('TEST') } ).toThrow();
    });

    it( 'can determine if a given level is enabled', function() {
        for( var a in levels ) {

            theGTMLoggerProvider.level( levels[a] );

            for( var b in levels ) {
                expect( theGTMLoggerProvider.isLevelEnabled( levels[b] )).toBe( b >= a );
            }
        }
    });

    it( 'can specify extra fields to be sent with each log message', function() {

      var extra = { "test": "extra" };

      theGTMLoggerProvider.fields( extra );

      expect( theGTMLoggerProvider.fields()).toEqual( extra );

    });

  });

  describe( 'GTMLogger', function() {

    var service, $log, imageMock;

    // helper function to parse payload of generated image url
    // pass in instantiated instance of URL with the 'src' property
    // of the mocked image as its argument. (e.g. new URL(imageMock.src))

    beforeEach(function () {
      inject(function ($injector) {
        service = $injector.get('GTMLogger');
        service.attach();

        $log = $injector.get('$log');
      });

    });

    afterEach(function () {
      imageMock = undefined;
    });

    it('should be registered', function () {
      expect(service).not.toBe(null);
    });

    it('will send a message to GTM when properly configured', function () {
      var message = { message: 'A test message' };
      var tag = 'GTMLogger';
      var generatedURL;

      theGTMLoggerProvider.includeUrl(false);
      theGTMLoggerProvider.inputTag(tag);

      service.sendMessage(message);

      expect(window.dataLayer.pop()).toEqual({message: 'A test message'});
    });


    it('will include the current url if includeUrl() is not set to false', function () {
      var message = {message: 'A Test message'};
      var parsedPayload;

      inject(function ($injector) {
        // mock browser url
        $injector.get('$browser').url('http://example.com');
      });

      theGTMLoggerProvider.includeUrl( true );

      service.sendMessage( message );
      expect(window.dataLayer.pop()).toEqual({message: 'A Test message', url: 'http://example.com'});

    });

    it( 'can set extra fields using the fields method', function() {
      var extra = { appVersion: '1.1.0', browser: 'Chrome' };

      expect( service.fields( extra )).toBe( extra );
      expect( service.fields() ).toEqual( extra );
    });


    it( 'will include extra fields if set via provider and service', function() {
      var extra = { appVersion: '1.1.0', browser: 'Chrome' };
      var message = 'A Test message';

      theGTMLoggerProvider.fields( extra );
      service.sendMessage( { message: message } );

      expect(window.dataLayer.pop()).toEqual({ appVersion: '1.1.0', browser: 'Chrome', message: message });

      extra.username = "nemo";
      service.fields( extra );
      service.sendMessage( { message: message } );
      expect(window.dataLayer.pop()).toEqual({ appVersion: '1.1.0', browser: 'Chrome', message: message, username: "nemo" });

    });


    it( 'will include extra fields if set via the service', function() {
      var extra = {appVersion: '1.1.0', browser: 'Chrome'};
      var message = 'A Test message';
      theGTMLoggerProvider.fields( extra );
      service.sendMessage( { message: message } );

      expect(window.dataLayer.pop()).toEqual({ appVersion: '1.1.0', browser: 'Chrome', message: message });
    });


    it( '$log has a GTMSender attached', function() {
      var logMessage = 'A Test Log Message';

      theGTMLoggerProvider.includeUrl( false );

      angular.forEach( levels, function (level) {
        $log[level.toLowerCase()].call($log, logMessage);;
        var entry = window.dataLayer.pop();
        expect(entry.message).toEqual(logMessage);
        expect(entry['level']).toEqual(level);
      });

    });

    it( 'will not send messages for levels that are not enabled', function() {
        var logMessage = 'A Test Log Message';

        spyOn(service, 'sendMessage').and.callThrough();

        for( var a in levels ) {

            theGTMLoggerProvider.level( levels[a] );

            for( var b in levels ) {

                $log[levels[b].toLowerCase()].call($log, logMessage);
                if( b >= a ) {
                    expect(service.sendMessage).toHaveBeenCalled();
                } else {
                    expect(service.sendMessage).not.toHaveBeenCalled();
                }

                service.sendMessage.calls.reset();
            }
        }

    });

    it( 'will not fail if the logged message is null or undefined', function() {
        var undefinedMessage;
        var nullMessage = null;

        expect( function() {
            $log.debug( undefinedMessage );
        }).not.toThrow();

        expect( function() {
            $log.debug( nullMessage );
        }).not.toThrow();

    });


  });

});
