import { FC } from 'react';

import { AnalysisStatus } from '@app-types/analysis';
import { Dropzone } from '@components/Dropzone';
import { Button } from '@ui/Button';

import styles from './FileUploadSection.module.css';

type Props = {
    file: File | null;
    status: AnalysisStatus;
    error: string | null;
    onFileSelect: (file: File) => void;
    onSend: () => void;
    onClear: () => void;
};

/**
 * Компонент секции загрузки и отправки файла
 */
export const FileUploadSection: FC<Props> = ({ file, status, error, onFileSelect, onSend, onClear }) => {
    const isProcessing = status === 'processing';
    const showSendButton = file && !isProcessing && status !== 'completed';

    return (
        <>
            <Dropzone file={file} status={status} error={error} onFileSelect={onFileSelect} onClear={onClear} />

            {showSendButton && (
                <Button type="button" variant="primary" disabled={!file} onClick={onSend} className={styles.sendButton}>
                    Отправить
                </Button>
            )}
        </>
    );
};
