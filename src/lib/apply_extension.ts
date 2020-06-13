export function applyRecordExtension<BaseClass extends { prototype: any }, ExtensionClass extends { prototype: any }>(
    base: BaseClass,
    extension: ExtensionClass,
) {
    for (const name of Object.getOwnPropertyNames(extension.prototype)) {
        // eslint-disable-next-line no-param-reassign
        base.prototype[name] = extension.prototype[name];
    }
}
