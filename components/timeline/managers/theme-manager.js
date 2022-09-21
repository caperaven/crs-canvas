export class ThemeManager {
    static async initialize(canvas) {
        canvas.__layers[0].clearColor = await this.get_variable_color("--timeline-bg") || BABYLON.Color3.FromHexString("#ffffff");
        canvas._theme = {
            header_bg:  await this.get_variable_color("--timeline-header-bg") || "#FFFFFF",
            header_border:  await this.get_variable_color("--timeline-header-bg") || "#DBDBDB"
        }
    }

    static async get_variable_color() {

    }
}