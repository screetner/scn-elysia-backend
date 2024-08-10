import {Static, t} from 'elysia'

export const PostGeoBody = t.Array(t.Object({
        latitude: t.Number(),
        longitude: t.Number()
    }),
    {
        description: "Post geolocation model",
    },
)

export type PostGeoBodyType = Static<typeof PostGeoBody>