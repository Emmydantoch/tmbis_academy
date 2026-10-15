import IconChangePass from '../assets/icons/IconChangePass.png';
import IconDashboard2 from '../assets/icons/IconDashboard2.png';
import IconExam from '../assets/icons/IconExam.png';
import IconFaculty from '../assets/icons/IconFaculty.png';
import IconHome from '../assets/icons/IconHome.png';
import IconLibrary from '../assets/icons/IconLibrary.png';
import IconLive from '../assets/icons/IconLive.png';
import IconLogout from '../assets/icons/IconLogout.png';
import IconOpenJ from '../assets/icons/IconOpenJ.png';
import IconPayment from '../assets/icons/IconPayment.png';
import IconResource from '../assets/icons/IconResource.png';
import IconSupport from '../assets/icons/IconSupport.png';

const navigationIcons = {
  home: IconHome,
  dashboard: IconDashboard2,
  people: IconFaculty,
  group: IconFaculty,
  school: IconExam,
  library_books: IconLibrary,
  menu_book: IconOpenJ,
  videocam: IconLive,
  quiz: IconExam,
  grade: IconExam,
  assessment: IconFaculty,
  account_balance_wallet: IconPayment,
  payments: IconPayment,
  article: IconResource,
  auto_awesome: IconSupport,
  admin_panel_settings: IconDashboard2,
  lock_reset: IconLogout,
  contact_support: IconChangePass,
  logout: IconLogout,
};

export default function NavigationIcon({ name }) {
  const image = navigationIcons[name];

  if (!image) {
    return (
      <span className="material-symbols-outlined" aria-hidden="true">
        {name}
      </span>
    );
  }

  return (
    <img
      src={image}
      alt=""
      aria-hidden="true"
      className="h-7 w-7 shrink-0 object-contain"
    />
  );
}
