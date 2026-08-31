import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  useEffect(() => {
    const header = document.querySelector('header')

    const handleScroll = () => {
      if (!header) return

      if (window.scrollY > 20) {
        header.classList.add('bg-surface/90', 'backdrop-blur-md', 'shadow-xl')
      } else {
        header.classList.remove('bg-surface/90', 'backdrop-blur-md', 'shadow-xl')
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-outline-variant/10 bg-surface transition-all duration-200 ease-in-out">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-margin-desktop">
          <div className="flex items-center gap-base">
            <img
              src="https://res.cloudinary.com/o68u6tlz/image/upload/v1786642649/TMBIS_Logio_hw0vzu1_kphx76.png"
              alt="TMBIS Academy logo"
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-headline-lg text-headline-lg font-bold text-primary">
              TMBIS Academy
            </span>
          </div>

          <div className="hidden items-center gap-xl md:flex">
            <a className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary" href="#about">
              About
            </a>
            <a className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary" href="#courses">
              Programs
            </a>
            <a className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary" href="#admissions">
              Admissions
            </a>
            <a className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary" href="#contact">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-md">
            <Link to="/apply" className="hidden font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary md:block">
              Apply Now
            </Link>
            <Link to="/login" className="rounded-lg bg-primary-fixed px-md py-sm font-bold text-on-primary transition-all hover:brightness-110">
              Login
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative flex min-h-[820px] items-center justify-center overflow-hidden">
          <div className="relative z-10 max-w-4xl px-margin-desktop text-center">
            <div className="mb-md inline-flex items-center gap-xs rounded-full border border-outline-variant/20 bg-surface-container-highest px-sm py-1">
              <span className="material-symbols-outlined text-sm text-primary-fixed">terminal</span>
              <span className="font-label-md text-label-md uppercase tracking-widest text-primary-fixed">
                Research-Driven Innovation
              </span>
            </div>
            <h1 className="mb-md font-headline-xl text-headline-xl text-primary md:text-[64px] md:leading-[72px]">
              Deep Dive into Excellence
            </h1>
            <p className="mx-auto mb-xl max-w-2xl font-body-md text-body-md leading-relaxed text-on-surface-variant text-lg">
              TMBIS Academy of Research is dedicated to technical mastery and intellectual immersion.
              Empowering the next generation of researchers with precision-driven academic frameworks.
            </p>
            <div className="flex flex-col items-center justify-center gap-md md:flex-row">
              <Link
                to="/apply"
                className="flex w-full items-center justify-center gap-sm rounded-lg bg-[#64ffda] px-xl py-md text-lg font-bold text-[#0a192f] transition-transform hover:scale-105 md:w-auto"
              >
                Proceed to Application
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                to="/payment"
                className="w-full rounded-lg border border-[#64ffda] px-xl py-md text-lg font-bold text-[#64ffda] transition-all hover:bg-[#64ffda]/10 md:w-auto text-center"
              >
                Make Payments
              </Link>
              <Link
                to="/registration"
                className="w-full rounded-lg border border-[#64ffda] px-xl py-md text-lg font-bold text-[#64ffda] transition-all hover:bg-[#64ffda]/10 md:w-auto text-center"
              >
                Register
              </Link>
            </div>
          </div>
        </section>

        {/* ==================== ABOUT THE SCHOOL ==================== */}
        <section id="about" className="overflow-hidden bg-surface-container-low py-xl">
          <div className="mx-auto max-w-7xl px-margin-desktop">
            <div className="grid grid-cols-1 items-center gap-xl lg:grid-cols-2">
              <div className="group relative">
                <div className="absolute -inset-2 rounded-2xl bg-primary-fixed/10 blur-xl transition-all group-hover:bg-primary-fixed/20"></div>
                <img
                  className="relative h-[480px] w-full rounded-2xl object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh-F-xSPXkrkvhJFsa7RxDGY37QRRC___BWM6a-f-6-svxkeXl0f_FrzUcBqQkHBMyOjwzFnVatsG6ACoyYDKMD_HWYtv0lwy_ZwFShRUy1Z1UidxWXIRBBJBmmYnIzFOZn-YiZfoLZTQcvZCwiHaO1pBHCZn4mWKFJTheje4s-W8oGjzYTP35Q4XoWacL-qeOpxbTnwYXtHzmWo20m0d6ZnL3SY6uyv7acSP8VIORXd5h0keL6x_ADdpbTCvLmqlHDLTguK8bP0jA"
                  alt="Futuristic university campus"
                />
              </div>

              <div className="flex flex-col gap-md">
                <span className="font-label-md text-primary-fixed uppercase tracking-widest">About TMBIS Academy</span>
                <h2 className="font-headline-lg text-headline-lg text-primary">
                  Where Technical Precision Meets Vast Potential
                </h2>
                <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
                  Established with the vision of deep technical research and high-level academic excellence,
                  TMBIS Academy provides an environment for unparalleled focus. Our curriculum is built on
                  empirical data, professional rigor, and real-world application.
                </p>
                <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
                  We train the next generation of researchers, engineers, and innovators through immersive
                  programs, live coaching, and cutting-edge resources.
                </p>
 
                <div className="mt-md grid grid-cols-2 gap-gutter">
                  {[
                    ['50+', 'Global Partners'],
                    ['15k+', 'Active Students'],
                    ['98%', 'Research Placement'],
                    ['12', 'Global Hubs'],
                  ].map(([value, label]) => (
                    <div key={label} className="border-l-2 border-primary-fixed bg-surface-container/50 p-md">
                      <span className="mb-xs block font-headline-lg text-4xl text-primary">{value}</span>
                      <span className="font-body-sm text-body-sm uppercase tracking-widest text-on-surface-variant">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== AVAILABLE COURSES ==================== */}
        <section id="courses" className="mx-auto max-w-7xl px-margin-desktop py-xl">
          <div className="mb-xl text-center">
            <span className="font-label-md text-primary-fixed uppercase tracking-widest">Our Programs</span>
            <h2 className="mt-2 font-headline-lg text-headline-lg text-primary">Available Courses</h2>
            <p className="mx-auto mt-3 max-w-2xl text-on-surface-variant">
              Choose from industry-relevant programs designed for the modern researcher and professional.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Computer Science',
                level: 'Undergraduate / Graduate',
                duration: '4 Years / 2 Years',
                description: 'Master algorithms, systems design, and software engineering with a strong research focus.',
                icon: 'terminal',
              },
              {
                title: 'Data Science & AI',
                level: 'Graduate / Certificate',
                duration: '18 Months',
                description: 'Deep learning, machine learning, and data engineering for real-world applications.',
                icon: 'psychology',
              },
              {
                title: 'Cybersecurity',
                level: 'Undergraduate / Professional',
                duration: '3–4 Years',
                description: 'Protect digital systems and infrastructure with advanced security frameworks.',
                icon: 'security',
              },
              {
                title: 'Business Administration',
                level: 'Undergraduate / MBA',
                duration: '4 Years / 2 Years',
                description: 'Leadership, strategy, and innovation for the next generation of business leaders.',
                icon: 'business_center',
              },
              {
                title: 'Research Methods',
                level: 'Graduate / PhD Support',
                duration: 'Flexible',
                description: 'Rigorous training in research design, academic writing, and publication strategies.',
                icon: 'science',
              },
              {
                title: 'Marine Robotics',
                level: 'Specialized Track',
                duration: '2 Years',
                description: 'Advanced robotics and autonomous systems for deep-sea exploration.',
                icon: 'precision_manufacturing',
              },
            ].map((course) => (
              <div
                key={course.title}
                className="flex flex-col gap-md rounded-2xl bg-surface-container p-md border border-outline-variant/20 hover:border-primary-fixed/40 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-highest">
                  <span className="material-symbols-outlined text-primary-fixed text-3xl">{course.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline-lg text-xl text-primary">{course.title}</h3>
                  <p className="mt-1 text-sm text-primary-fixed">{course.level}</p>
                  <p className="mt-3 font-body-md text-body-md text-on-surface-variant">{course.description}</p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-outline-variant/10 pt-md">
                  <span className="text-sm text-on-surface-variant">{course.duration}</span>
                  <Link to="/apply" className="text-primary-fixed font-medium hover:underline flex items-center gap-1">
                    Apply <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== ADMISSIONS & SESSION DATES ==================== */}
        <section id="admissions" className="bg-surface-container-low py-xl">
          <div className="mx-auto max-w-7xl px-margin-desktop">
            <div className="mb-xl text-center">
              <span className="font-label-md text-primary-fixed uppercase tracking-widest">Admissions</span>
              <h2 className="mt-2 font-headline-lg text-headline-lg text-primary">Session Dates & Application Windows</h2>
              <p className="mx-auto mt-3 max-w-2xl text-on-surface-variant">
                Plan ahead. Below are the upcoming academic sessions and when admission forms become available.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
              {/* Next Session */}
              <div className="rounded-2xl bg-surface-container border border-primary-fixed/30 p-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-6xl">event</span>
                </div>
                <span className="inline-block rounded-full bg-primary-fixed/10 px-3 py-1 text-xs font-medium text-primary-fixed mb-4">
                  NEXT SESSION
                </span>
                <h3 className="text-2xl font-bold text-primary mb-2">Full Semester 2026</h3>
                <p className="text-on-surface-variant mb-6">Classes commence on <strong className="text-primary">September 15, 2026</strong></p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-fixed text-lg">calendar_today</span>
                    Orientation: Sept 8 – 12, 2026
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-fixed text-lg">schedule</span>
                    Duration: 16 Weeks
                  </li>
                </ul>
              </div>

              {/* Admission Form Sales */}
              <div className="rounded-2xl bg-surface-container border border-outline-variant/20 p-md">
                <span className="inline-block rounded-full bg-primary-fixed/10 px-3 py-1 text-xs font-medium text-primary-fixed mb-4">
                  ADMISSION FORMS
                </span>
                <h3 className="text-2xl font-bold text-primary mb-2">Form Sales Open</h3>
                <p className="text-on-surface-variant mb-6">
                  Online application forms are now available.
                </p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                    <span className="text-sm">Sales Start</span>
                    <span className="font-medium text-primary">July 15, 2026</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                    <span className="text-sm">Early Bird Deadline</span>
                    <span className="font-medium text-primary">August 20, 2026</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Final Closing Date</span>
                    <span className="font-medium text-primary">September 5, 2026</span>
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div className="rounded-2xl bg-surface-container border border-outline-variant/20 p-md">
                <span className="inline-block rounded-full bg-primary-fixed/10 px-3 py-1 text-xs font-medium text-primary-fixed mb-4">
                  KEY DATES
                </span>
                <h3 className="text-2xl font-bold text-primary mb-6">Academic Calendar</h3>
                <ul className="space-y-5">
                  <li className="flex gap-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-xs text-on-surface-variant">AUG</div>
                      <div className="text-xl font-bold text-primary">20</div>
                    </div>
                    <div>
                      <p className="font-medium">Early Application Deadline</p>
                      <p className="text-sm text-on-surface-variant">Priority consideration</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-xs text-on-surface-variant">SEP</div>
                      <div className="text-xl font-bold text-primary">05</div>
                    </div>
                    <div>
                      <p className="font-medium">Final Application Deadline</p>
                      <p className="text-sm text-on-surface-variant">Late applications close</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-xs text-on-surface-variant">SEP</div>
                      <div className="text-xl font-bold text-primary">15</div>
                    </div>
                    <div>
                      <p className="font-medium">New Session Begins</p>
                      <p className="text-sm text-on-surface-variant">Fall 2026 classes start</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 rounded-lg bg-[#64ffda] px-xl py-md text-lg font-bold text-[#0a192f] transition-all hover:brightness-110"
              >
                Start Your Application Now
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <p className="mt-4 text-sm text-on-surface-variant">
                Application forms are currently on sale. Don’t miss the early bird window.
              </p>
            </div>
          </div>
        </section>

        {/* Academic Bulletin (kept from original) */}
        <section className="mx-auto max-w-7xl px-margin-desktop py-xl">
          <div className="mb-xl flex flex-col items-end justify-between gap-md md:flex-row">
            <div className="max-w-2xl">
              <h2 className="mb-sm font-headline-lg text-headline-lg text-primary">Academic Bulletin</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Real-time pulses from the depths of our research laboratories and academic departments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            {[
              {
                label: 'ANNOUNCEMENT',
                title: 'Expansion of Marine Robotics Lab',
                text: 'We are excited to announce a $15M investment into our deep-sea autonomous systems facility.',
                date: 'Oct 12, 2026',
                icon: 'newspaper',
              },
              {
                label: 'SEMINAR',
                title: 'Quantum Cryptography Summit',
                text: 'Join global experts for a 3-day deep dive into the future of secure ocean-floor data transmission.',
                date: 'Nov 04, 2026',
                icon: 'event_note',
              },
              {
                label: 'HONOR',
                title: 'Global Research Excellence Award',
                text: 'TMBIS Academy has been ranked #1 for Technical Sustainability in higher education.',
                date: 'Awarded 2026',
                icon: 'workspace_premium',
              },
            ].map((item) => (
              <div key={item.title} className="bento-card flex flex-col gap-md rounded-xl bg-surface-container p-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-highest">
                  <span className="material-symbols-outlined text-primary-fixed">{item.icon}</span>
                </div>
                <div>
                  <span className="mb-xs block font-label-md text-label-md text-primary-fixed/60">{item.label}</span>
                  <h3 className="mb-sm font-headline-lg text-xl text-primary">{item.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{item.text}</p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-outline-variant/10 pt-md">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{item.date}</span>
                  <span className="material-symbols-outlined text-primary-fixed">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="px-margin-desktop py-xl">
          <div className="glass-effect relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-outline-variant/10 p-xl text-center">
            <h2 className="mb-sm font-headline-lg text-headline-lg text-primary">Secure Your Future</h2>
            <p className="mx-auto mb-xl max-w-xl font-body-md text-body-md text-on-surface-variant">
              Ready to join the next cohort? Complete your application or speak with an enrollment specialist.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
              <Link
                to="/resources"
                className="rounded-lg bg-[#64ffda] px-xl py-md text-lg font-bold text-[#0a192f] transition-all hover:brightness-110"
              >
                Blogs & Resources
              </Link>
              <Link
                to="/contact"
                className="rounded-lg border border-[#64ffda] px-xl py-md text-lg font-bold text-[#64ffda] transition-all hover:bg-[#64ffda]/10"
              >
                Contact Admissions
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer (kept mostly the same) */}
      <footer className="w-full border-t border-outline-variant/10 bg-surface-container-highest">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-gutter px-margin-desktop py-xl md:grid-cols-4">
          <div className="md:col-span-1">
            <span className="mb-md block font-headline-lg text-headline-lg font-semibold text-primary">
              TMBIS Academy
            </span>
            <p className="mb-md font-body-sm text-body-sm leading-relaxed text-secondary opacity-80">
              Leading global research through immersion and technical innovation.
            </p>
          </div>

          <div>
            <h4 className="mb-md font-label-md text-primary">RESOURCES</h4>
            <ul className="flex flex-col gap-sm">
              <li><a className="font-body-sm text-body-sm text-on-surface-variant opacity-80 hover:text-primary" href="#courses">Programs</a></li>
              <li><a className="font-body-sm text-body-sm text-on-surface-variant opacity-80 hover:text-primary" href="#admissions">Admissions</a></li>
              <li><a className="font-body-sm text-body-sm text-on-surface-variant opacity-80 hover:text-primary" href="#">Library</a></li>
              <li><a className="font-body-sm text-body-sm text-on-surface-variant opacity-80 hover:text-primary" href="#">Scholarships</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-md font-label-md text-primary">COMPLIANCE</h4>
            <ul className="flex flex-col gap-sm">
              <li><a className="font-body-sm text-body-sm text-on-surface-variant opacity-80 hover:text-primary" href="#">Privacy Policy</a></li>
              <li><a className="font-body-sm text-body-sm text-on-surface-variant opacity-80 hover:text-primary" href="#">Terms of Service</a></li>
              <li><a className="font-body-sm text-body-sm text-on-surface-variant opacity-80 hover:text-primary" href="#">Accessibility</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-md font-label-md text-primary">CONTACT</h4>
            <p className="font-body-sm text-body-sm text-secondary opacity-80">
              admissions@tmbis.academy
            </p>
            <p className="mt-2 font-body-sm text-body-sm text-primary-fixed">
              +234 (814) 136-1935
            </p>
          </div>
        </div>

        <div className="border-t border-outline-variant/10 px-margin-desktop py-md text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © 2026 TMBIS Academy of Research. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}