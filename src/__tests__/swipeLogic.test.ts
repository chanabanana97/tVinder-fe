import { describe, it, expect } from 'vitest'

function advance(index: number, len: number) {
    return Math.min(index + 1, len)
}

function settleSwipe(x: number, threshold = 120) {
    if (x > threshold) return 'like'
    if (x < -threshold) return 'pass'
    return 'reset'
}

describe('swipe logic', () => {
    it('advances index', () => {
        expect(advance(0, 3)).toBe(1)
        expect(advance(2, 3)).toBe(3)
    })

    it('maps drag distance to the correct action', () => {
        expect(settleSwipe(150)).toBe('like')
        expect(settleSwipe(-150)).toBe('pass')
        expect(settleSwipe(30)).toBe('reset')
    })
})
