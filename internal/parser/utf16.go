package parser

import (
	"archive/zip"
	"bytes"
	"io"
	"os"

	"golang.org/x/text/encoding/unicode"
	"golang.org/x/text/transform"
)

// ConvertUTF16XLSXToUTF8 reads a zip file, converts any UTF-16 XML files to UTF-8,
// and saves the result to a temporary file. It returns the path to the temp file.
func ConvertUTF16XLSXToUTF8(inputPath string) (string, error) {
	r, err := zip.OpenReader(inputPath)
	if err != nil {
		return "", err
	}
	defer r.Close()

	tmpFile, err := os.CreateTemp("", "mt5-analyzer-*.xlsx")
	if err != nil {
		return "", err
	}

	w := zip.NewWriter(tmpFile)

	decoder := unicode.UTF16(unicode.LittleEndian, unicode.UseBOM).NewDecoder()

	for _, f := range r.File {
		rc, err := f.Open()
		if err != nil {
			tmpFile.Close()
			return "", err
		}

		// Read the first two bytes to check for UTF-16LE BOM (\xff\xfe)
		header := make([]byte, 2)
		n, err := io.ReadFull(rc, header)
		
		fw, err := w.Create(f.Name)
		if err != nil {
			rc.Close()
			tmpFile.Close()
			return "", err
		}

		if n == 2 && header[0] == 0xff && header[1] == 0xfe {
			// It's UTF-16LE. We need to decode the rest.
			// Prepend header to a new reader
			multi := io.MultiReader(bytes.NewReader(header), rc)
			utf8Reader := transform.NewReader(multi, decoder)
			
			// Some XML files specify encoding="UTF-16" in their prolog, which excelize's xml parser will STILL complain about.
			// We need to replace encoding="UTF-16" with encoding="UTF-8".
			b, err := io.ReadAll(utf8Reader)
			if err != nil {
				rc.Close()
				tmpFile.Close()
				return "", err
			}
			
			b = bytes.ReplaceAll(b, []byte("encoding=\"UTF-16\""), []byte("encoding=\"UTF-8\""))
			b = bytes.ReplaceAll(b, []byte("encoding=\"utf-16\""), []byte("encoding=\"utf-8\""))
			
			_, err = fw.Write(b)
		} else {
			// Not UTF-16LE BOM, just copy
			if n > 0 {
				fw.Write(header[:n])
			}
			_, err = io.Copy(fw, rc)
		}

		rc.Close()
		if err != nil {
			tmpFile.Close()
			return "", err
		}
	}

	err = w.Close()
	tmpFile.Close()
	if err != nil {
		return "", err
	}

	return tmpFile.Name(), nil
}
