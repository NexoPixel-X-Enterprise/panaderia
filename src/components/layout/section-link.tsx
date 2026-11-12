'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'

type SectionLinkProps = ComponentProps<typeof Link>

export default function SectionLink(props: SectionLinkProps) {
  const handleNavigate: NonNullable<SectionLinkProps['onNavigate']> = (event) => {
    if (typeof props.href !== 'string' || !props.href.startsWith('#')) {
      return
    }

    const section = document.getElementById(props.href.slice(1))

    if (!section) {
      return
    }

    event.preventDefault()

    if (window.location.hash) {
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}`,
      )
    }

    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return <Link {...props} onNavigate={handleNavigate} />
}
