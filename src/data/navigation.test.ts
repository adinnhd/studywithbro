import { describe, expect, it } from 'vitest'
import { getBreadcrumbItems, physicsCategories, physicsTopics, routeLabels } from './navigation'

describe('physics navigation and legacy URLs', () => {
  it('exposes two categories, nine pending lessons and only the existing Katrol lesson', () => {
    expect(physicsTopics.map((topic) => topic.title)).toEqual([
      'Usaha dan Energi',
      'Pesawat Sederhana',
    ])
    expect(physicsTopics.map((topic) => topic.path)).toEqual(
      physicsCategories.map((category) => category.path),
    )
    expect(physicsCategories.map((category) => category.topics.length)).toEqual([6, 4])
    const topics = physicsCategories.flatMap((category) => category.topics)
    expect(topics.filter((topic) => topic.available).map((topic) => topic.path)).toEqual([
      '/ipa/fisika/katrol',
    ])
    expect(topics.filter((topic) => !topic.available)).toHaveLength(9)
    const all = physicsCategories.flatMap((category) => [category, ...category.topics])
    expect(new Set(all.map((item) => item.path)).size).toBe(12)
    for (const item of all) expect(routeLabels[item.path.split('/').at(-1)!]).toBe(item.title)
  })

  it('inserts the curriculum parent for every legacy Katrol path without changing URLs', () => {
    const common = [
      { path: '/ipa', label: 'IPA' },
      { path: '/ipa/fisika', label: 'Fisika' },
      { path: '/ipa/fisika/pesawat-sederhana', label: 'Pesawat Sederhana' },
      { path: '/ipa/fisika/katrol', label: 'Katrol' },
    ]
    expect(getBreadcrumbItems('/ipa/fisika/katrol')).toEqual(common)
    expect(getBreadcrumbItems('/ipa/fisika/katrol/latihan')).toEqual([
      ...common,
      { path: '/ipa/fisika/katrol/latihan', label: 'Latihan Soal' },
    ])
    for (const id of ['a', 'b', 'c']) {
      expect(getBreadcrumbItems(`/ipa/fisika/katrol/latihan/${id}`)).toEqual([
        ...common,
        { path: '/ipa/fisika/katrol/latihan', label: 'Latihan Soal' },
        { path: `/ipa/fisika/katrol/latihan/${id}`, label: `Latihan ${id.toUpperCase()}` },
      ])
    }
  })

  it('does not duplicate real ancestors or add a Katrol parent to unrelated routes', () => {
    for (const category of physicsCategories) {
      for (const topic of category.topics) {
        const items = getBreadcrumbItems(topic.path)
        expect(items.filter((item) => item.path === category.path)).toHaveLength(1)
        expect(items.at(-2)?.path).toBe(category.path)
        expect(items.at(-1)).toEqual({ path: topic.path, label: topic.title })
      }
    }
    expect(getBreadcrumbItems('/ipa/fisika/katrol/')).toEqual(
      getBreadcrumbItems('/ipa/fisika/katrol'),
    )
    expect(getBreadcrumbItems('/ipa/fisika/katrol-lain').map((item) => item.label)).toEqual([
      'IPA',
      'Fisika',
      'katrol-lain',
    ])
    expect(getBreadcrumbItems('/ipa/kimia')).toEqual([
      { path: '/ipa', label: 'IPA' },
      { path: '/ipa/kimia', label: 'Kimia' },
    ])
    expect(getBreadcrumbItems('/')).toEqual([])
  })
})
