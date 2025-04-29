// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function clsn(values: any[]): string {
    return values.filter(it => typeof it === 'string').join(' ')
}