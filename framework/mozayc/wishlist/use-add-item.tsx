import { useCallback } from 'react'
import type { MutationHook } from '@commerce/utils/types'
import { CommerceError } from '@commerce/utils/errors'
import useAddItem, { UseAddItem } from '@commerce/wishlist/use-add-item'
import useCustomer from '../customer/use-customer'
import useWishlist from './use-wishlist'
import type { Product, ProductVariant } from '@commerce/types'

export type ItemBody = {
  productId: Product['id']
  variantId: ProductVariant['id']
}

type AddItemBody = { item: ItemBody }

export default useAddItem as UseAddItem<typeof handler>

export const handler: MutationHook<any, {}, ItemBody, AddItemBody> = {
  fetchOptions: {
    url: '/api/wishlist',
    method: 'POST',
  },
  useHook:
    ({ fetch }) =>
    () => {
      const { data: customer } = useCustomer()
      const { revalidate } = useWishlist()

      return useCallback(
        async function addItem(item) {
          if (!customer) {
            // A signed customer is required in order to have a wishlist
            throw new CommerceError({
              message: 'Signed customer not found',
            })
          }

          // TODO: add validations before doing the fetch
          const data = await fetch({ input: { item } })
          await revalidate()
          return data
        },
        [fetch, revalidate, customer]
      )
    },
}
