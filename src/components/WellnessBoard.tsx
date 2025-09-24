/* eslint-disable @next/next/no-img-element */
/*
  Figma: Wellness board frame converted to React + Tailwind
  Notes:
  - Uses Tailwind utility classes as generated
  - Image assets reference a local dev image server per Figma Dev Mode output
*/

const imgLinearSettingsFineTuningWidget2 = "http://localhost:3845/assets/e0a863c4581f8dd1cb8b5e8493c2b0849bb842f9.svg";
const imgCalendarDots = "http://localhost:3845/assets/9ad63b2416d560c86beec546af16918dc1478003.svg";
const imgPersonSimpleRun = "http://localhost:3845/assets/9adbe264a9218183c54b3aef442ca9f2363e8dfa.svg";
const imgListHeart = "http://localhost:3845/assets/bc6d2c03c5c9f9e1e4fa59e4adf87a7785793eac.svg";
const imgForkKnife = "http://localhost:3845/assets/a9148425530a9ba4fe05027ef9c23969437153c4.svg";
const imgBookOpen = "http://localhost:3845/assets/f9e4d70d9efff7ace10fe44e8bd84ffc4134be53.svg";
const imgOutlineArrowsActionLogout2 = "http://localhost:3845/assets/212aecb05b011a88e1ee03366fd76c2e4cee929a.svg";
const imgLine1 = "http://localhost:3845/assets/47e0f25d4845a6120ea3bd1b7ad8a3e0b78d966d.svg";

export default function WellnessBoard() {
  return (
    <div
      className="bg-white overflow-clip relative rounded-[30px] shadow-[40px_60px_72px_0px_rgba(0,0,0,0.12)] w-full min-h-[960px]"
      data-name="Wellness board"
      data-node-id="2:1602"
    >
      <div
        className="absolute bg-[#202125] box-border content-stretch flex flex-col h-[928px] items-center justify-between left-[16px] px-[16px] py-[32px] rounded-[20px] top-[16px] w-[80px]"
        data-name="side bar"
        data-node-id="2:1603"
      >
        <div
          className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0"
          data-name="menu"
          data-node-id="2:1604"
        >
          <div
            className="bg-[rgba(249,249,249,0.15)] box-border content-stretch flex gap-[10px] items-center justify-center overflow-clip p-[12px] relative rounded-[100px] shrink-0 size-[48px]"
            data-name="dashboard"
            data-node-id="2:1605"
          >
            <div
              className="relative shrink-0 size-[24px]"
              data-name="Linear / Settings, Fine Tuning / Widget 2"
              data-node-id="2:1606"
            >
              <img alt="" className="block max-w-none size-full" src={imgLinearSettingsFineTuningWidget2} />
            </div>
          </div>
          <div
            className="box-border content-stretch flex gap-[10px] items-center justify-center overflow-clip px-[12px] py-0 relative rounded-[12px] shrink-0 size-[48px]"
            data-name="calendar"
            data-node-id="2:1610"
          >
            <div className="relative shrink-0 size-[24px]" data-name="CalendarDots" data-node-id="2:1611">
              <img alt="" className="block max-w-none size-full" src={imgCalendarDots} />
            </div>
          </div>
          <div
            className="box-border content-stretch flex gap-[10px] items-center justify-center overflow-clip p-[12px] relative rounded-[12px] shrink-0 size-[48px]"
            data-name="sport"
            data-node-id="2:1613"
          >
            <div className="relative shrink-0 size-[24px]" data-name="PersonSimpleRun" data-node-id="2:1614">
              <img alt="" className="block max-w-none size-full" src={imgPersonSimpleRun} />
            </div>
          </div>
          <div
            className="box-border content-stretch flex gap-[10px] items-center justify-center overflow-clip p-[12px] relative rounded-[12px] shrink-0 size-[48px]"
            data-name="journal"
            data-node-id="2:1616"
          >
            <div className="relative shrink-0 size-[24px]" data-name="ListHeart" data-node-id="2:1617">
              <img alt="" className="block max-w-none size-full" src={imgListHeart} />
            </div>
          </div>
          <div
            className="box-border content-stretch flex gap-[10px] items-center justify-center overflow-clip p-[12px] relative rounded-[12px] shrink-0 size-[48px]"
            data-name="food"
            data-node-id="2:1619"
          >
            <div className="relative shrink-0 size-[24px]" data-name="ForkKnife" data-node-id="2:1620">
              <img alt="" className="block max-w-none size-full" src={imgForkKnife} />
            </div>
          </div>
          <div
            className="box-border content-stretch flex gap-[10px] items-center justify-center overflow-clip p-[12px] relative rounded-[12px] shrink-0 size-[48px]"
            data-name="books"
            data-node-id="2:1622"
          >
            <div className="relative shrink-0 size-[24px]" data-name="BookOpen" data-node-id="2:1623">
              <img alt="" className="block max-w-none size-full" src={imgBookOpen} />
            </div>
          </div>
        </div>
        <div
          className="relative shrink-0 size-[24px]"
          data-name="Outline / Arrows Action / Logout 2"
          data-node-id="2:1625"
        >
          <img alt="" className="block max-w-none size-full" src={imgOutlineArrowsActionLogout2} />
        </div>
      </div>
      <div className="absolute flex h-[0px] items-center justify-center left-[1049.25px] top-[-84.65px] w-[0px]">
        <div className="flex-none rotate-[2.828deg]">
          <div className="h-[260.26px] relative w-[464.984px]" data-name="line-1" data-node-id="2:1627">
            <div className="absolute inset-[-1.15%_-0.65%]">
              <img alt="" className="block max-w-none size-full" src={imgLine1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
