from manim import *

class PythagoreanTheorem(Scene):
    def construct(self):
        # Points of the triangle
        A = ORIGIN
        B = A + 4 * RIGHT
        C = A + 3 * UP

        # Draw triangle
        triangle = Polygon(A, B, C, color=BLUE)
        self.play(Create(triangle))

        # Right angle box
        right_angle = Square(side_length=0.3, color=WHITE, fill_opacity=1).move_to(A + 0.15 * RIGHT + 0.15 * UP)
        self.play(FadeIn(right_angle))

        # Labels
        a_label = MathTex("a").next_to(Line(A, C), LEFT)
        b_label = MathTex("b").next_to(Line(B, C), UP)
        c_label = MathTex("c").next_to(Line(A, B), DOWN)
        self.play(Write(a_label), Write(b_label), Write(c_label))

        # Squares on each side
        square_a = Square(3, color=GREEN).move_to(C + 1.5 * LEFT)
        square_b = Square(4, color=YELLOW).move_to(B + 2 * UP)
        square_c = Square(5, color=RED).move_to(B + 2.5 * DOWN + 2 * LEFT).rotate(-PI/2)

        self.play(Create(square_a), Create(square_b), Create(square_c))

        # Area labels
        area_a = MathTex("a^2").move_to(square_a.get_center())
        area_b = MathTex("b^2").move_to(square_b.get_center())
        area_c = MathTex("c^2").move_to(square_c.get_center())
        self.play(Write(area_a), Write(area_b), Write(area_c))

        # Final equation
        theorem = MathTex("a^2 + b^2 = c^2").to_edge(DOWN).scale(1.2)
        self.play(Write(theorem))
        self.wait(2)

