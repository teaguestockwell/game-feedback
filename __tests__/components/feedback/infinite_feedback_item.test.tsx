import {InfiniteFeedbackItem} from '../../../components/feedback/infinite_feedback_item'
import {screen, render} from '@testing-library/react'

const mockFeedback: Types.Feedback.WithUser = {
  id: '1',
  user: {
    oauthImgSrc: 'img',
    oauthName: 'name',
  },
  userId: '1',
  gameSessionId: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
  comment: '',
  rating: 1,
}

it('renders', () => {
  render(<InfiniteFeedbackItem feedback={mockFeedback} />)
  expect(screen.getByText('name')).toBeInTheDocument()
})