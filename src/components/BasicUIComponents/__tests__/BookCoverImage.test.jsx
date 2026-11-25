import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BookCoverImage from "../BookCoverImage";

describe("BookCoverImage", () => {
  it("renderiza la imagen cuando hay src y muestra fallback tras onError", () => {
    render(
      <BookCoverImage
        src="https://example.com/broken.jpg"
        alt="Portada de prueba"
        fallback={<div data-testid="cover-fallback">Sin portada</div>}
      />
    );

    const img = screen.getByAltText("Portada de prueba");
    expect(img).toBeInTheDocument();

    fireEvent.error(img);
    expect(screen.queryByAltText("Portada de prueba")).not.toBeInTheDocument();
    expect(screen.getByTestId("cover-fallback")).toBeInTheDocument();
  });

  it("reintenta automáticamente cuando cambia la prop src", () => {
    const { rerender } = render(
      <BookCoverImage
        src="https://example.com/broken.jpg"
        alt="Portada"
        fallback={<div data-testid="cover-fallback">Sin portada</div>}
      />
    );

    fireEvent.error(screen.getByAltText("Portada"));
    expect(screen.getByTestId("cover-fallback")).toBeInTheDocument();

    rerender(
      <BookCoverImage
        src="https://example.com/valid.jpg"
        alt="Portada"
        fallback={<div data-testid="cover-fallback">Sin portada</div>}
      />
    );

    expect(screen.getByAltText("Portada")).toHaveAttribute(
      "src",
      "https://example.com/valid.jpg"
    );
  });
});
