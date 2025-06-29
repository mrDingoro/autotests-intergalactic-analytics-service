import { Highlights } from '@app-types/common';
import { FileUploadSection } from '@components/FileUploadSection';
import { HighlightsSection } from '@components/HighlightsSection';
import { useCsvAnalysis } from '@hooks/use-csv-analysis';
import { useAnalysisStore } from '@store/analysisStore';
import { Typography } from '@ui/Typography';
import { addToHistory } from '@utils/storage';

import styles from './HomePage.module.css';

export const HomePage = () => {
    const { file, status, highlights, error, setFile, setStatus, setHighlights, reset, setError } = useAnalysisStore();

    const onComplete = (highlights?: Highlights) => {
        setStatus('completed');

        if (file) {
            addToHistory({ fileName: file.name, highlights });
        }
    };

    const onError = (error: Error) => {
        setError(error.message);

        if (file) {
            addToHistory({ fileName: file.name });
        }
    };

    const { analyzeCsv } = useCsvAnalysis({
        onData: setHighlights,
        onComplete,
        onError,
    });

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
    };

    const handleSend = async () => {
        if (!file || status === 'processing') {
            return;
        }

        setStatus('processing');

        await analyzeCsv(file);
    };

    return (
        <div className={styles.container}>
            <Typography as="h1" size="m" className={styles.title}>
                Загрузите <b>csv</b> файл и <b>получите полную</b> информацию о нём за сверхнизкое время
            </Typography>

            <FileUploadSection
                file={file}
                status={status}
                error={error}
                onFileSelect={handleFileSelect}
                onSend={handleSend}
                onClear={reset}
            />

            <HighlightsSection highlights={highlights} />
        </div>
    );
};
