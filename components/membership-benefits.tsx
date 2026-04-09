"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const benefits = [
  {
    title: "No high fees or commissions",
    description:
      "CMM members pay only $29 per listing. No percentage-based commissions or hidden fees. Keep more of what your vehicle is worth.",
  },
  {
    title: "Member to Member Sales",
    description:
      "Only Classic Motor Market Members can contact sellers. Deal with real people. Avoid bots and scammers common on other sites.",
  },
  {
    title: "Create high quality listings fast",
    description:
      "Our specialized listing process makes it fast and easy to create detailed, professional listings. No waiting weeks for a stressful auction to go live.",
  },
  {
    title: "Early access to new listings",
    description:
      "Members get exclusive early access to newly published listings before they are visible to the public.",
  },
  {
    title: "Curated European Vehicles",
    description:
      "A focused marketplace dedicated to European classic and enthusiast vehicles. No tire-kickers, no noise — just cars worth your attention.",
  },
  {
    title: "Buy and inspect in person",
    description:
      "Purchase vehicles without auction pressure. Inspect and test drive on your schedule. All sales are completed offline between approved members.",
  },
]

export function MembershipBenefits() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {benefits.map((benefit) => (
        <AccordionItem
          key={benefit.title}
          value={benefit.title}
          className="border-b border-brand-dark/15"
        >
          <AccordionTrigger className="py-5 text-base sm:text-lg font-semibold text-brand-dark hover:no-underline hover:text-brand-gold">
            {benefit.title}
          </AccordionTrigger>
          <AccordionContent className="text-sm sm:text-base leading-relaxed text-brand-dark/80">
            {benefit.description}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
