import * as yup from 'yup'
import {usingJWT} from '../../../../middleware/using_jwt'
import {usingMethods} from '../../../../middleware/using_methods'
import {
  ApiError,
  usingMiddleware,
} from '../../../../middleware/using_middleware'
import {client} from '../../../../prisma/client'

const bodySchema = yup.object().shape({
  comment: yup.string().required().max(2000),
  rating: yup.number().required().min(0).max(4),
})

// the following is a type before casting to the yup schema
// aka params.pageSize is still a string
// to get they type after a yup cast use: yup.TypeOf<typeof schema>
interface BodySchema extends yup.Asserts<typeof bodySchema> {}

const Route = async (
  req: Types.Next.NextApiRequest,
  res: Types.Next.NextApiResponse
) =>
  usingMiddleware(req, res, async () => {
    await usingMethods(req, ['PUT'])
    // create or update my feedback at this gameSession
    const gameSessionId = req.query.gameSessionId as string

    const body = req.body as BodySchema

    // verify user is logged in
    const jwt = await usingJWT(req)

    // verify req body is valid
    try {
      await bodySchema.validate(req.body)
    } catch (e) {
      res.status(400).json({msg: `${e}`})
      return
    }

    // verify game session exists
    const gameSession = await client.gameSession.findUnique({
      where: {id: gameSessionId},
    })

    if (!gameSession) {
      throw new ApiError({status: 404, body: {msg: 'Game session not found'}})
    }

    const data = {
      userId: jwt.sub as string,
      gameSessionId,
      comment: body.comment,
      rating: body.rating,
    }

    const updatedFeedback = await client.feedback.upsert({
      // select model by compound primary key
      where: {
        userId_gameSessionId: {
          userId: jwt.sub as string,
          gameSessionId,
        },
      },
      create: data,
      update: data,
    })

    if (!updatedFeedback) {
      throw new ApiError({status: 404, body: {msg: 'User not found'}})
    }

    res.status(200).json(updatedFeedback)
  })

export default Route
