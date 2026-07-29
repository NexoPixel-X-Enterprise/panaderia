import { useTranslations } from "next-intl"
import { MailIcon, PhoneIcon, InstagramIcon, FacebookIcon, GithubIcon } from "../ui/Icons"

export default function Footer(){

    const t = useTranslations("Footer")

    return (
      <footer className="pt-12 pb-5 w-full bg-[#070913] bg-[radial-gradient(ellipse_at_center,_#1B0425_0%,_#050A15_50%)] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-around text-sm gap-8 pb-8 max-[800px]:flex-col">
            <div className="space-y-3">
              <div className="text-white font-bold text-xl font-heading tracking-wider text-[#d5d5d5]">
                NexoPixel X
              </div>
              <p className="leading-relaxed max-w-xs font-body text-[#d5d5d5aa]">
                {t("description")}
              </p>
            </div>

            <div className="space-y-4 text-[#d5d5d5]/70">
              <h5 className="text-white font-bold text-xl font-heading tracking-wider text-[#d5d5d5]">
                {t('contact-info-title')}
              </h5>
              <div className="flex items-center gap-2.5">
                <MailIcon className="w-5 drop-shadow-[0_0_3px_rgba(213,213,213,0.8)]"></MailIcon>
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=nexopixelx@gmail.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="footer email"
                  className="hover:text-[#AC19E5] transition-colors font-body"
                >
                  nexopixelx@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneIcon className="w-5 drop-shadow-[0_0_3px_rgba(213,213,213,0.8)]"></PhoneIcon>
                <a
                  href="https://wa.me/584167428059" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="footer whatsapp"
                  className="hover:text-[#AC19E5] transition-colors font-body"
                >
                  0416-7428059
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-white font-bold text-xl font-heading tracking-wider text-[#d5d5d5]">
                {t('follow-us-label')}
              </h5>
              <div className="flex gap-5 text-[#d5d5d5]/70">
                <a 
                  href="https://www.instagram.com/nexopixel_25/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="instagram"
                  className="group hover:text-[#0055FF] drop-shadow-[0_0_1px_rgba(213,213,213,0.8)] hover:drop-shadow-[0_0_1px_rgba(0,85,225,0.8)]"
                >
                  <InstagramIcon className="drop-shadow-[0_0_3px_rgba(213,213,213,0.8)]"></InstagramIcon>
                </a>
                <a 
                  href="#"
                  aria-label="facebook" 
                  className="group hover:text-[#0055FF] drop-shadow-[0_0_3px_rgba(213,213,213,0.8)] hover:drop-shadow-[0_0_3px_rgba(0,85,225,0.8)]"
                >
                  <FacebookIcon></FacebookIcon>
                </a>
                <a 
                  href="https://github.com/nexopixelx-rgb"
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="github"
                  className="group hover:drop-shadow-[0_0_3px_rgba(0,85,225, 0.8)] hover:text-[#0055FF] drop-shadow-[0_0_1px_rgba(213,213,213,0.8)] hover:drop-shadow-[0_0_1px_rgba(0,85,225,0.8)]"
                >
                  <GithubIcon className="drop-shadow-[0_0_3px_rgba(213,213,213,0.8)]"></GithubIcon>
                </a>
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-[#2B71FF] drop-shadow-[0_0_3px_rgb(43,113,255)] my-6"></div>

          <div className="py-6 text-center font-body text-xs text-[#d5d5d5dd]">
            © {t('rights-reserved-label')}
          </div>
        </div>
      </footer>
    )
}