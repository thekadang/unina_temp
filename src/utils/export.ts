/**
 * 파일 내보내기/불러오기 유틸리티
 */

/**
 * 데이터를 JSON 파일로 다운로드
 * @param data 내보낼 데이터
 * @param filename 파일명 (확장자 제외)
 */
export function downloadJson(data: unknown, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * JSON 파일 업로드 및 파싱
 * @returns 파싱된 데이터를 담은 Promise
 */
export function uploadJson<T>(): Promise<T> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          resolve(data);
        } catch (err) {
          reject(new Error('Failed to parse JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };

    input.click();
  });
}

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * 현재 시간을 ISO 형식으로 반환
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}
