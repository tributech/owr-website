import 'devices.css';

// Target visible device height in CSS px. Derive per-device zoom from
// the native heights (iPhone 14 = 868, Galaxy S8 = 828) so both frames
// render at the same height regardless of their native aspect ratios.
const TARGET_HEIGHT = 600;
const iosZoom: React.CSSProperties = { zoom: TARGET_HEIGHT / 868 };
const androidZoom: React.CSSProperties = { zoom: TARGET_HEIGHT / 828 };

const screenStyle: React.CSSProperties = {
  imageRendering: 'auto',
  WebkitFontSmoothing: 'antialiased',
};

export default function MobileTesterPreview() {
  return (
    <div className="flex justify-center items-start gap-4 sm:gap-6">
      <div className="flex flex-col items-center">
        <div style={iosZoom}>
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
        <div style={androidZoom}>
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
  );
}
