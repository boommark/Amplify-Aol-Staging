// DOM environment will be configured in Wave 1 when component tests have assertions
import { describe, it } from 'vitest'

describe('CopyBlock image integration (ADS-04)', () => {
  describe('InstagramFrame', () => {
    it.todo('renders img tag when imageUrl is provided and imageStatus is ready')
    it.todo('renders skeleton shimmer when imageStatus is generating')
    it.todo('renders Retry button when imageStatus is failed')
    it.todo('renders download link with correct filename')
  })

  describe('FacebookFrame', () => {
    it.todo('renders img with aspect-video for 16:9')
    it.todo('shows skeleton shimmer during generation')
  })

  describe('WhatsAppFrame', () => {
    it.todo('renders image above message content')
    it.todo('shows download button when image is ready')
  })

  describe('FlyerFrame', () => {
    it.todo('renders image with 2:3 portrait aspect ratio')
    it.todo('shows download button when image is ready')
  })

  describe('FlavorPicker', () => {
    it.todo('renders two pill buttons: Warm Realism and Playful Concept')
    it.todo('selected pill has active styling')
    it.todo('calls onChange when unselected pill is clicked')
    it.todo('disables both pills when disabled prop is true')
  })
})
