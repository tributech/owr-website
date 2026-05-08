import 'devices.css';

// Zoom values are kept in CSS (see styles below) so we can use media queries
// to shrink the frames on small viewports. Inline `zoom` would beat them.
//
// Native frame sizes: iPhone 14 = 428x868, Galaxy S8 = 360x828.

const screenStyle: React.CSSProperties = {
  imageRendering: 'auto',
  WebkitFontSmoothing: 'antialiased',
};

export default function MobileTesterPreview() {
  return (
    <>
      <div className="mobile-tester-preview flex justify-center items-start gap-3 sm:gap-6">
        <div className="flex flex-col items-center">
          <div className="device-zoom device-zoom-ios">
            <div className="device device-iphone-14">
              <div className="device-frame">
                <img
                  className="device-screen"
                  src="/images/mobile/ios-tester-screen-1.png"
                  alt="OWR iOS app screenshot"
                  style={screenStyle}
                  loading="lazy"
                />
              </div>
              <div className="device-stripe"></div>
              <div className="device-header"></div>
              <div className="device-sensors"></div>
              <div className="device-btns"></div>
              <div className="device-power"></div>
              <div className="device-home"></div>
            </div>
          </div>
          <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">iOS</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="device-zoom device-zoom-android">
            <div className="device device-galaxy-s8">
              <div className="device-frame">
                <img
                  className="device-screen"
                  src="/images/mobile/android-tester-screen-1.png"
                  alt="OWR Android app screenshot"
                  style={screenStyle}
                  loading="lazy"
                />
              </div>
              <div className="device-stripe"></div>
              <div className="device-header"></div>
              <div className="device-sensors"></div>
              <div className="device-btns"></div>
              <div className="device-power"></div>
              <div className="device-home"></div>
            </div>
          </div>
          <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">Android</span>
        </div>
      </div>
      <style>{`
        /* Shrunk for narrow phone viewports so both frames fit without horizontal scroll. */
        .device-zoom-ios { zoom: 0.34; }
        .device-zoom-android { zoom: 0.36; }
        @media (min-width: 480px) {
          .device-zoom-ios { zoom: 0.5; }
          .device-zoom-android { zoom: 0.52; }
        }
        @media (min-width: 640px) {
          .device-zoom-ios { zoom: 0.69; }
          .device-zoom-android { zoom: 0.72; }
        }
      `}</style>
    </>
  );
}
