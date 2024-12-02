export interface StorageInterface {
    containerIdentifier: string;
    publicContainerIdentifier: string;

    getStaticUrl({ object_identifier, container_identifier }: { object_identifier: string; container_identifier: string }): string;

    getStaticBaseUrl({ container_identifier }: { container_identifier: string }): string;

    uploadFile({ file, object_identifier, isPublic }: { file: File; object_identifier: string; isPublic: boolean }): Promise<boolean>;

    deleteFile({ object_identifier, container_identifier }: { object_identifier: string; container_identifier: string }): Promise<boolean>;
}

export class StorageBase {
    containerIdentifier?: string = undefined;
    publicContainerIdentifier?: string = undefined;

    getStaticUrl({ object_identifier, container_identifier }: { object_identifier?: string; container_identifier?: string }): string {
        return "";
    }

    getStaticBaseUrl({ container_identifier }: { container_identifier?: string }): string {
        return "";
    }

    async uploadFile({
        file,
        object_identifier,
        isPublic
    }: {
        file: File;
        object_identifier: string;
        isPublic: boolean;
    }): Promise<boolean> {
        return false;
    }

    async deleteFile({
        object_identifier,
        container_identifier
    }: {
        object_identifier?: string;
        container_identifier?: string;
    }): Promise<boolean> {
        return false;
    }
}
